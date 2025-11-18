from django.contrib import admin
from django.contrib.postgres.search import SearchQuery, SearchRank
from django.db.models.functions import Length
from django.db.models import F
from django import forms
from .models import (
    Entry,
    Tag,
    Quotation,
    Quoteback,
    Blogmark,
    Comment,
    Note,
    Series,
    PreviousTagName,
    LiveUpdate,
)
from .quoteback_utils import fetch_page_metadata, download_favicon


class BaseAdmin(admin.ModelAdmin):
    date_hierarchy = "created"
    raw_id_fields = ("tags",)
    list_display = ("__str__", "slug", "created", "tag_summary", "is_draft")
    list_filter = ("created", "is_draft")
    autocomplete_fields = ("tags",)
    readonly_fields = ("import_ref",)
    exclude = ("search_document",)

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related("tags")

    def get_search_results(self, request, queryset, search_term):
        if not search_term:
            return super().get_search_results(request, queryset, search_term)
        query = SearchQuery(search_term, search_type="websearch")
        rank = SearchRank(F("search_document"), query)
        queryset = (
            queryset.annotate(rank=rank).filter(search_document=query).order_by("-rank")
        )
        return queryset, False


@admin.register(Entry)
class EntryAdmin(BaseAdmin):
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "body")
    list_filter = ("created", "series")


@admin.register(LiveUpdate)
class LiveUpdateAdmin(admin.ModelAdmin):
    raw_id_fields = ("entry",)


@admin.register(Quotation)
class QuotationAdmin(BaseAdmin):
    search_fields = ("tags__tag", "quotation")
    list_display = ("__str__", "source", "created", "tag_summary", "is_draft")
    prepopulated_fields = {"slug": ("source",)}


@admin.register(Blogmark)
class BlogmarkAdmin(BaseAdmin):
    search_fields = ("tags__tag", "commentary")
    prepopulated_fields = {"slug": ("link_title",)}


@admin.register(Note)
class NoteAdmin(BaseAdmin):
    search_fields = ("tags__tag", "body")
    list_display = ("__str__", "created", "tag_summary", "is_draft")


class QuotebackAdminForm(forms.ModelForm):
    """Custom form for Quoteback that auto-fetches metadata."""

    fetch_metadata = forms.BooleanField(
        required=False,
        initial=True,
        help_text="Automatically fetch title, author, and favicon from source URL"
    )

    class Meta:
        model = Quoteback
        fields = "__all__"

    def save(self, commit=True):
        instance = super().save(commit=False)

        # Fetch metadata if requested and URL is present
        if self.cleaned_data.get("fetch_metadata") and instance.source_url:
            # Only fetch if we don't already have a title (new object or URL changed)
            should_fetch = (
                not instance.pk or  # New object
                not instance.page_title or  # No title yet
                self.has_changed() and "source_url" in self.changed_data  # URL changed
            )

            if should_fetch:
                metadata = fetch_page_metadata(instance.source_url)

                # Update fields if not already set
                if not instance.page_title:
                    instance.page_title = metadata.get("title", "")

                if not instance.author and metadata.get("author"):
                    instance.author = metadata["author"]

                # Download and save favicon if we have a URL and no favicon yet
                if metadata.get("favicon_url") and not instance.favicon:
                    favicon_file = download_favicon(metadata["favicon_url"])
                    if favicon_file:
                        instance.favicon.save(favicon_file.name, favicon_file, save=False)

        if commit:
            instance.save()
            self.save_m2m()

        return instance


@admin.register(Quoteback)
class QuotebackAdmin(BaseAdmin):
    form = QuotebackAdminForm
    search_fields = ("tags__tag", "quote_text", "page_title", "author")
    list_display = ("__str__", "page_title", "source_domain", "created", "tag_summary", "is_draft")
    prepopulated_fields = {"slug": ("page_title",)}
    fieldsets = (
        (None, {
            "fields": ("quote_text", "commentary", "title", "slug")
        }),
        ("Source Information", {
            "fields": ("source_url", "fetch_metadata", "page_title", "author", "favicon")
        }),
        ("Metadata", {
            "fields": ("tags", "created", "is_draft", "series", "card_image", "metadata", "import_ref"),
            "classes": ("collapse",)
        }),
    )


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    search_fields = ("tag",)

    def get_search_results(self, request, queryset, search_term):
        search_term = search_term.strip()
        if search_term:
            return (
                queryset.filter(tag__istartswith=search_term)
                .annotate(tag_length=Length("tag"))
                .order_by("tag_length"),
                False,
            )
        else:
            return queryset.all(), False

    def save_model(self, request, obj, form, change):
        if change:
            old_obj = Tag.objects.get(pk=obj.pk)
            if old_obj.tag != obj.tag:
                PreviousTagName.objects.create(tag=obj, previous_name=old_obj.tag)
        super().save_model(request, obj, form, change)


admin.site.register(
    Comment,
    list_filter=("created", "visible_on_site", "spam_status", "content_type"),
    search_fields=("body", "name", "url", "email", "openid"),
    list_display=(
        "name",
        "admin_summary",
        "on_link",
        "created",
        "ip_link",
        "visible_on_site",
        "spam_status_options",
    ),
    list_display_links=("name", "admin_summary"),
    date_hierarchy="created",
)

admin.site.register(
    Series,
    list_display=(
        "title",
        "slug",
    ),
)


admin.site.register(
    PreviousTagName, raw_id_fields=("tag",), list_display=("previous_name", "tag")
)
