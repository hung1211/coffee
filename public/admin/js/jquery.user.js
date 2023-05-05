$(document).ready(function () {
    getRole();
    getUser();
    //getBrand();
    $('#btnGenPass').click(function () {
        const pass = document.getElementById("user-pass");
        const repass = document.getElementById("user-repass");
        var passGen = generatePassword(10);
        pass.value = passGen; repass.value = passGen
    })
});

function showPassword() {
    var x = document.getElementById("user-pass");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function getUser() {
    var id = document.getElementById("userID").value;
    if (id != null && id.length > 0 && parseInt(id) > 0) {
        
        $("#user-pass").prop('required', false);
        $("#user-repass").prop('required', false);
        $('#page-title').text('Chỉnh sửa thông tin')
        var link = "/admin/getUserByID?id=" + id;
        $.get(link, function (data, status) {
            var _data = JSON.parse(data)
            if (_data != undefined) {
                $('#fname').val(_data.fname);
                $('#lname').val(_data.lname);
                $('#user-email').val(_data.email);
                $('#userrole').val(_data.role);
                $('#btnAdd').text('OK');
                $('#btnDelete').show();
            }
        });
    }
}

function updateUser() {
    var id = document.getElementById("userID").value;
    if (id != null && id.length > 0 && parseInt(id) > 0 && $("#user-pass").val().length>0) {
        $("#user-repass").prop('required', true);
    }
    if (!isValidate()) {
        return false;
    }
    const fname = document.getElementById("fname");
    const lname = document.getElementById("lname");
    const email = document.getElementById("user-email");
    const pass = document.getElementById("user-pass");
    const repass = document.getElementById("user-repass");
    const role = document.getElementById("userrole");
    var data_user = {
        'id': id,
        "fname": fname.value,
        "lname": lname.value,
        "email": email.value,
        "password": pass.value,
        "role": role.value
    }
    const formData = new FormData();
    if (id != undefined && id.length > 0 && parseInt(id) > 0)
        formData.append("id", id);
    formData.append("fname", fname.value);
    formData.append("lname", lname.value);
    formData.append("email", email.value);
    formData.append("password", pass.value);
    formData.append("role", role.value);
    $.ajax({
        url: "/admin/api/updateuser", // send ajax
        type: "POST", // choose method
        data: JSON.stringify(data_user),
        contentType: 'application/json; charset=UTF-8',
        success: function (result) {

        },
        complete: function (result) {
            console.log(result.responseText);
            if (result.responseText == 'edited') {
                $.showNotification({
                    body: "Edit Success",
                    duration: 2000,
                    type: "success"
                })
            } else if (result.responseText == 'added') {
                $('#cofirmAdd-modal').modal('show')
            } else
                $.showNotification({
                    body: "Fail",
                    duration: 2000,
                    type: "danger"
                })
        },
        cache: false,
        processData: false,
    });
}

//Delete User 
function deleteUser() {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
        return false;
    } else {
        var id = document.getElementById("userID").value;
        if (id.length > 0 && parseInt(id) > 0) {
            var link = "/admin/deleteUserByID?id=" + id;

            $.get(link, function (data, status) {
                console.log(data)
            });
        }
    }
}

function getRole() {
    var link = "/admin/getRoleList"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = '<option value="{{id}}">{{rolename}}</option>'
        var htmlInner = '<option value="0">Phân quyền cho nhân viên</option>';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });
        console
        $('#userrole').html(htmlInner);
    });
}