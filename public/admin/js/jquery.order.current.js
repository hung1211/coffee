$(document).ready(function () {
    gettable();
});
function gettable() {
    var link = "/api/getcurrenttable"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#table-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
        
            $.each(_data, function (index, item) {
                if (item.TotalPrice > 0) { item.StatusColor = 'bg-success'; item.Status = 'Có khách' }
                else { item.StatusColor = 'bg-secondary'; item.Status = 'Trống'; item.TotalPrice = '' }
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });

        $('#tableList').html(htmlInner);
        $('.table-item.bg-success').click(function () {
            tableDetails($(this).attr('data-id'), $(this).attr('data-name'));
        })
    });
}

function tableDetails(id, name) {
    //$('#btnDeletetable').show();
    $('#orderModal').attr('data-id', id)
    $('#orderModal').attr('data-name', name)
    getCurrentOrderDetails(id, name);

    $("#orderModal").modal('show');
}

function getCurrentOrderDetails(id, name) {
    var link = "/api/getProductInCurrentOrder?id=" + id
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        $("#orderModal-title").text('Bàn ' + name);
        if (_data.CreateTime != null) {
            createtime = new Date(_data.CreateTime);
            $('#order-details').attr('data-creattime', _data.CreateTime);
            $("#orderModal-title").text('Bàn ' + name + ' - Giờ vào: ' + getTimeString(createtime))
        }
        if (_data.ProductList.length > 0) {
            var productList = JSON.parse(_data.ProductList)
            var tempHtml = $('#order-deltais-template').html();
            var rowid=1;

            var htmlInner = '';
            if (productList != undefined && productList.length > 0)
                $.each(productList, function (index, item) {
                    item.calPrice = (parseInt(item.price) * parseInt(item.qty)).toLocaleString(window.document.documentElement.lang) + ' VND'
                    item.rowid = rowid;
                    let rendered = Mustache.render(tempHtml, item);
                    htmlInner += rendered;
                });
            $('#orderModal table tfoot span').text(_data.TotalPrice.toLocaleString(window.document.documentElement.lang) + ' VND')
            
            $('#orderModal table tbody').html(htmlInner);
        } 
    });
}