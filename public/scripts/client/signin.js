define('client/signin', [], function () {
    const signIn = {};

    signIn.initialize = function () {
        const {redirect} = Application;

        $('.password-show-toggle').on('click', function () {
            $(this).find('i').toggleClass('fa-eye-slash');

            $('#password-input').attr('type', function(index, attr){
                return attr == 'password' ? null : 'password';
            });
        });

        $('#signin-form').on('submit', function (e) {
            e.preventDefault();
            $('#errors-area').hide();
            signIn.addShimmer();

            const form = $(this).serializeObject();
            form.redirect = redirect;

            $.ajax({
                url: '/signin',
                method: 'post',
                data: form,
            }).then(res => {
                    if (res && res.next) {
                        location.href = res.next;
                    }
                })
                .catch(err => {
                    let errMessage;
					if (err.responseJSON) {
						errMessage = err.responseJSON.status && err.responseJSON.status.message ?
							err.responseJSON.status.message :
							err.responseJSON.error;
					}

                    $('#errors-area > span').text(errMessage);
                    $('#errors-area').show();

                    signIn.removeShimmer();
                    core.scrollToTop();
                });
        });
    }

    signIn.addShimmer = function () {
        $('[type="submit"]').empty()
            .attr('disabled', true)
            .append('<i class="fa fa-spinner fa-spin align-self-center" aria-hidden="true"></i>');
    }

    signIn.removeShimmer = function () {
        $('[type="submit"]').empty().attr('disabled', false).append('Sign In');
    }

    return signIn;
});