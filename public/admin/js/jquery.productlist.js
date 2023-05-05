$(document).ready(function () {
    //$('#liProduct').addClass('active')
    //Fill Data to Datatable id=tbList
    $('#productTable').DataTable({
        processing: true,
        responsive: true,
        //Call 'Get' Method to get all row in table tb_product
        ajax: {
            "url": "/admin/getProduct",
            "type": "GET",
            "dataSrc": ""
        },
        //Fill data each column
        columns: [
            {
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
            },
            { data: 'ProductID' },
            { data: 'ProductName' },
            { data: 'CategoryName' },
            { data: 'Price' },
            { data: 'ImageUrl' },
            { data: 'Discount' },
            { data: 'Remain' },
        ],
        //Modify column name and Image
        columnDefs: [
            //Show column name with <a> tag link to edit product
            {
                render: function (data, type, row) {
                    console.log(row)
                    return '<a href="/admin/product/' + row.ProductID + '">' + unescape(data) + '</a>'
                },
                targets: 2,
            },
            { visible: false, targets: [1] },
            //Take first image is thumnail image
            {
                render: function (data, type, row) {
                    var image1st = JSON.parse(data);
                    if (image1st != undefined && image1st.length > 0) {
                        imageUrl = image1st[0].Url;
                        return '<img src="' + imageUrl + '" alt="" width="100">';
                    }
                    else
                        return "no image";
                },
                targets: 5,
            },
            {
                render: function (data, type, row) {
                    return '<div class="text-lg font-weight-bold text-primary text-uppercase mb-1 divDiscount" data-id="' + row.ProductID + '"><span>' + data + '</span><div>';
                },
                targets: 6,
            },
        ],
    }).on('draw', function () {
        $('.divDiscount').unbind();
        $('.divDiscount').click(function () {
            $(this).hide()
            var showDiscount = $(this);
            var curDiscount = showDiscount.find('span').text()
            var _td = showDiscount.parent()
            var id = $(this).attr('data-id');
            $(_td).append('<div class="input-group"><input type="text" class="form-control inputDiscount" placeholder=""><div class="input-group-append"><button class="btn btn-primary btnEditDiscount" type="button">OK</button></div></div>')
            var inputDiscount = $(_td).find('input.inputDiscount');
            $(inputDiscount).keypress(function (e) {

                var charCode = (e.which) ? e.which : event.keyCode

                if (String.fromCharCode(charCode).match(/[^0-9]/g))

                    return false;

            });
            inputDiscount.val(curDiscount);
            inputDiscount.focus();

            $(_td).find('button.btnEditDiscount').on('click', function () {
                var link = "/admin/updatediscount?id=" + id + "&discount=" + inputDiscount.val()
                $.get(link, function (data, status) {
                    showDiscount.html("<span>" + inputDiscount.val() + "</span>")
                    showDiscount.show()
                    inputDiscount.parent().remove();
                });
            })
        })
        $.each($('.divDiscount'), function(index, item){
            var _td = $(item).parent()
            var inputDiscount = $(_td).find('input.inputDiscount').hide();
            inputDiscount.parent().remove();
            $(item).show()
        })
    });

});


