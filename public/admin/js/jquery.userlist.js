$(document).ready(function () {
    //$('#liProduct').addClass('active')
    //Fill Data to Datatable id=tbList
    $('#userTable').DataTable({
        processing: true,
        responsive: true,
        //Call 'Get' Method to get all row in table tb_product
        ajax: {
            "url": "/admin/getuser",
            "type": "GET",
            "dataSrc": ""
        },
        //Fill data each column
        columns: [
            {
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
            },
            { data: 'id' },
            { data: 'fname' },
            { data: 'lname' },
            { data: 'email' },
            { data: 'role' },
            { data: 'last_login' }
        ],
        //Modify column name and Image
        columnDefs: [
            //Show column name with <a> tag link to edit product
            {
                render: function (data, type, row) {
                    return '<a class="btn btn-outline-primary" href="/admin/user/'+row.id+'">' + row.fname + ' ' + row.lname + '</a>'
                },
                targets: 2,
            },
            { visible: false, targets: [1] },
            { visible: false, targets: [3] },
            {
                render: function (data, type, row) {
                    console.log(data)
                    return getFullDateTimeString(new Date(data));
                },
                targets: 6,
            },
        ],
    });
});


