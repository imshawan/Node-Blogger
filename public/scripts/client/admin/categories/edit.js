define('client/admin/categories/edit', ['modules/http', 'client/admin/categories/events'], function (http, events) {
    const edit = {};

    edit.initialize = function () {
        const {category, tags} = Application;
        
        events.initialize();
        edit.attachEvents(category, tags);
        
    }
    
    edit.attachEvents = function (category, tags) {
        const message = `This action will permanently remove all its associated content, posts, subcategories, and tags from the platform.`;
        const select2Options = {
            placeholder: "Create tags",
            width: '100%',
            tags: true,
            data: tags
        };

        $("#tagsInput").select2(select2Options);

        $("#tagsInput").on('select2:unselect', function (e) {
            let deselectedOption = e.params.data;
            let data = $(deselectedOption.element).data();
            let id = data.tagId || deselectedOption.id;

            edit.deleteTag(category.cid, id);
        });

        $("#tagsInput").on('select2:select', function (e) {
            let selectedOption = e.params.data;
            let {text} = selectedOption;

            edit.createTag(category.cid, {name: text}).then((res) => {
                if (res && res._id) {
                    $("#tagsInput option").val(text).attr('data-tag-id', res.tagid);
                }
            }).catch(e => core.alertError(e.message))
        });

        $('#delete-category').on('click', function () {
            var dialog = bootbox.dialog({
                title: `Are you sure to delete category <span class="font-italic">"${category.name}"</span>`,
                message: `
                    <p>${message}</p>
                    <p>${edit.getDeletionPointers(category)}</p>
                    <p><span class="text-danger font-weight-semibold">Warning!</span> This process cannot be undone. Please ensure that you have carefully reviewed the consequences before proceeding with this action.</p>
                    `,
                buttons: {
                    cancel: {
                        label: "Cancel",
                        className: 'btn-danger',
                        callback: function(){
                            dialog.hide('modal');
                        }
                    },
                    ok: {
                        label: "Ok",
                        className: 'btn-info',
                        callback: function(){
                            edit.deleteCategory(category.cid);
                        }
                    }
                },
            });
        });

        $('#category-form').on('submit', function (e) {
            e.preventDefault();

            const formData = new FormData($(this)[0])
            const categoryImage = $('#category-image')[0].files;
            const altThumb = $('[name="altThumb"]').val();

            formData.append('altThumb', altThumb);

            if (categoryImage && categoryImage.length) {
                if (categoryImage[0].type.split('/')[0] == 'image') {
                    formData.append('thumb', categoryImage[0]);
                }
            }

            edit.updateCategory(category.cid, formData);

        });
    }

    edit.updateCategory = function (id, formData) {
        http.PUT('/api/v1/admin/categories/' + id, formData, {
            cache: false,
            contentType: false,
            processData: false,
        }).then(res => {
            core.alertSuccess('Category information updated!');

        }).catch(err => {
            core.alertError(err.message);
        });
    }

    edit.deleteCategory = function (id) {
        http.DELETE('/api/v1/admin/categories/' + id).then(res => {
            const callback = () => location.href = [location.origin, 'admin', 'categories'].join('/');

            core.alertSuccess('Category deleted!', callback);

        }).catch(err => {
            core.alertError(err.message);
        });
    }

    edit.createTag = function (categoryId, formData) {
        return new Promise((resolve, reject) => {
            http.POST(`/api/v1/admin/categories/${categoryId}/tags`, formData).then(res => resolve(res)).catch(err => {
                reject(err.message);
            });
        });
    }

    edit.deleteTag = function (categoryId, tagId) {
        http.DELETE(`/api/v1/admin/categories/${categoryId}/tags/${tagId}`).then(res => {}).catch(err => {
            core.alertError(err.message);
        });
    }

    edit.getDeletionPointers = function (category) {
        let {name} = category;
        name = `<span class="font-monospace font-weight-semibold">${name}</span>`;
        return `
            <ul>
                <li>All content, including posts, sub-categories and media, within ${name} will be deleted and cannot be recovered. This would impact the discoverability of content.</li>
                <li>Users who have engaged with the category will lose access to their contributions, and ongoing discussions will be terminated.</li>
            </ul>
        `
    }

    return edit;
});