$(document).ready(function () {
    //$('#liProduct').addClass('active')
    //Fill Data to Datatable id=tbList
    $('#roleTable').DataTable({
        processing: true,
        responsive: true,
        searching: false,
        //Call 'Get' Method to get all row in table tb_product
        ajax: {
            "url": "/admin/getRoleList",
            "type": "GET",
            "dataSrc": ""
        },
        //Fill data each column
        columns: [
            { data: 'id' },
            { data: 'rolename' }
        ],
        //Modify column name and Image
        columnDefs: [
            //Show column name with <a> tag link to edit product
            /**{
                render: function (data, type, row) {
                    console.log(row)
                    return '<a href="/admin/role/' + row.ProductID + '">' + unescape(data) + '</a>'
                },
                targets: 2,
            },*/
            { visible: false, targets: [0] },
        ],
    });

    $("#btnAdd").click(function () {
        $("#roleModal").modal('show');
        document.getElementById("roleName").value = ''
        $("#roleName").attr('data-id', '');
        $('#btnDeleteRole').hide();
    });

    $('#roleTable tbody').on('click', 'tr', function () {
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            $('#role-page-access').hide();

        } else {
            $('#roleTable').DataTable().$('tr.selected').removeClass('selected');
            $(this).addClass('selected');

            $('#role-page-access table tbody').html($('#role-page-template').html());
            $('input.changePageRole').bootstrapToggle();

            $('#role-page-access').show();
            var currentRow = $(this).closest("tr");
            console.log(currentRow);
            var data = $('#roleTable').DataTable().row(currentRow).data();
            renderPageRole(data)

        }
    });
});

function callEventForCheckbox() {

    $('input.changePageRole').change(function () {
        var status = $(this).prop('checked') ? 1 : 0;
        var roleid = $('#role-page-access').attr('data-id');
        var action = $(this).attr('data-action');
        var link = $(this).attr('data-link');
        var getlink = "/admin/updaterolepage?id=" + roleid
            + "&link=" + link
            + "&action=" + action
            + "&status=" + status;
        $.get(getlink, function (data, status) {
            console.log('get success: ', data)
        });
    })

}

function clearEventCheckbox() {
    $('input.changePageRole').change(function () {
        return false;
    })
}

function addRole() {
    const name = document.getElementById("roleName").value;

    var link = "/admin/addrole?name=" + name;
    $.get(link, function (data, status) {
        $.showNotification({
            body: "Add Role Success",
            duration: 2000,
            type: "success"
        })
        var rowNext = $('#roleTable').DataTable().count() + 1;
        $('#roleTable').DataTable().row.add({ "id": data, "rolename": name }).draw()

        $("#roleModal").modal('hide');
    });
}

function renderPageRole(data) {
    console.log(data)
    $('#role-page-access').attr('data-id', data.id);
    $('#role-page-access .card-header h6').text("Quyền Truy Cập Của " + data.rolename);
    $('#inputRoleName').val(data.rolename)
    var link = "/admin/getRolePageList?id=" + data.id;
    $.get(link, function (data, status) {
        console.log('get success: ', data)
        var htmlInner = "";
        if (data != undefined && data.length > 0) {
            var _data = JSON.parse(data)
            $.each(_data, function (index, item) {
                if (item.viewrole == 1)
                    $('#role-page-access table tbody tr input.changePageRole[data-link=' + item.pagerole + '][data-action=viewrole]').bootstrapToggle('on');
                if (item.editrole == 1)
                    $('#role-page-access table tbody tr input.changePageRole[data-link=' + item.pagerole + '][data-action=editrole]').bootstrapToggle('on');
                if (item.deleterole == 1)
                    $('#role-page-access table tbody tr input.changePageRole[data-link=' + item.pagerole + '][data-action=deleterole]').bootstrapToggle('on');
            });

        }
        callEventForCheckbox();
    });
}

function changeRoleName() {
    if ($('#inputRoleName').prop('disabled')) {
        $("#inputRoleName").prop('disabled', false);

    } else {
        var newName = $("#inputRoleName").val();
        if (newName.length > 0) {
            var roleid = $('#role-page-access').attr('data-id');
            var link = "/admin/addrole?id=" + roleid + "&name=" + newName;
            $.get(link, function (data, status) {
                $('#roleTable').DataTable().row($('#roleTable tr.selected')).data({id:roleid, rolename:newName}).draw()
                $("#inputRoleName").prop('disabled', true);
                $.showNotification({
                    body: "Edit Role Success",
                    duration: 2000,
                    type: "success"
                })
            });
        }
    }
}


