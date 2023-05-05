$(document).ready(function () {
    getOrderThisWeek();
    $('#inputStartDate').datepicker({ format: 'dd/mm/yyyy', });
    $('#inputEndDate').datepicker({ format: 'dd/mm/yyyy', });

    $('#btnLookUpOrderByDate').click(function () {
        var startDate = getDateFromString($('#inputStartDate').val());
        var endDate = getDateFromString($('#inputEndDate').val());
        if (startDate != undefined) {
            if (endDate != undefined)
                showOrder(getFullDateTimeString(startDate), getFullDateTimeString(endDate));
            else
                $('#errorDate').show();
        } else $('#errorDate').show();
    })
});

function getOrderThisWeek() {
    $('#btnThisWeek').removeClass('btn-outline-primary').addClass('btn-primary')
    $('#btnThisMonth').removeClass('btn-primary').addClass('btn-outline-primary')
    $('#btnThisYear').removeClass('btn-primary').addClass('btn-outline-primary')
    var startDate = (new Date()).GetFirstDayOfWeek();
    var endDate = (new Date()).GetLastDayOfWeek();
    $('#inputStartDate').val(getDateForPrint(startDate).replaceAll("-", "/"))
    $('#inputEndDate').val(getDateForPrint(endDate).replaceAll("-", "/"))
    showOrder(getFullDateTimeString(startDate), getFullDateTimeString(endDate));

}

function getOrderThisMonth() {
    $('#btnThisWeek').removeClass('btn-primary').addClass('btn-outline-primary')
    $('#btnThisMonth').removeClass('btn-outline-primary').addClass('btn-primary')
    $('#btnThisYear').removeClass('btn-primary').addClass('btn-outline-primary')

    var startDate = (new Date()).GetFirstDayOfMonth();
    var endDate = (new Date()).GetLastDayOfMonth();
    $('#inputStartDate').val(getDateForPrint(startDate).replaceAll("-", "/"))
    $('#inputEndDate').val(getDateForPrint(endDate).replaceAll("-", "/"))
    showOrder(getFullDateTimeString(startDate), getFullDateTimeString(endDate));
}

function getOrderThisYear() {
    $('#btnThisWeek').removeClass('btn-primary').addClass('btn-outline-primary')
    $('#btnThisMonth').removeClass('btn-primary').addClass('btn-outline-primary')
    $('#btnThisYear').removeClass('btn-outline-primary').addClass('btn-primary')

    var startDate = (new Date()).GetFirstDayOfYear();
    var endDate = (new Date()).GetLastDayOfYear();
    $('#inputStartDate').val(getDateForPrint(startDate).replaceAll("-", "/"))
    $('#inputEndDate').val(getDateForPrint(endDate).replaceAll("-", "/"))
    showOrder(getFullDateTimeString(startDate), getFullDateTimeString(endDate));
}

function showOrder(startDate, endDate) {
    showLoading();
    $('#dataTable').DataTable().destroy();
    $('#dataTable').DataTable({
        processing: true,
        responsive: true,
        //Call 'Get' Method to get all row in table tb_product
        ajax: {
            "url": "api/getOrderAll?startDate=" + startDate + "&endDate=" + endDate,
            "type": "GET",
            "dataSrc": "",
            complete: function (data) {

                if (data.responseJSON.length > 0) {
                    console.log(data.responseJSON)
                    var totalPrice = 0;
                    $.each(data.responseJSON, function (index, item) {
                        totalPrice += parseInt(item.TotalPrice);
                    })
                    $('#spanRevenueToday').text(totalPrice.toLocaleString(window.document.documentElement.lang) + ' VND')
                }
            }
        },
        //Fill data each column
        columns: [
            {
                data: null,
                render: (data, type, row, meta) => meta.row + 1,
            },
            { data: 'OrderID' },
            { data: 'TableName' },
            { data: 'Date' },
            { data: 'CreateTime' },
            { data: 'LeaveTime' },
            { data: 'TotalPrice' },
        ],
        //Modify column name and Image
        columnDefs: [
            //Show column name with <a> tag link to edit product
            {
                render: function (data, type, row) {
                    return '<button class="btn btn-outline-info" onclick="showDetails(' + row.OrderID + ', ' + row.TableName + ', ' + row.TotalPrice + ')">' + unescape(data) + '</button>'
                },
                targets: 2,
            },
            { visible: false, targets: [1] },
            {
                render: function (data, type, row) {
                    return getDateForPrint(new Date(row.CreateTime))
                },
                targets: 3,
            },
            {
                render: function (data, type, row) {
                    return getTimeString(new Date(data))
                },
                targets: 4,
            },
            {
                render: function (data, type, row) {
                    return getTimeString(new Date(data))
                },
                targets: 5,
            },
            {
                render: function (data, type, row) {
                    return parseInt(data).toLocaleString(window.document.documentElement.lang) + ' VND'
                },
                targets: 6,
            },
            //Take first image is thumnail image
        ]
    }).on('init.dt', function (e, settings) {

        hideLoading()
    });
}



function showDetails(id, tableName, total) {
    var link = "/api/getorderdetailbyorderid?id=" + id;
    $.get(link, function (data, status) {
        var htmlInner = "";
        if (data != undefined && data.length > 0) {
            var _data = JSON.parse(data)
            $.each(_data, function (index, item) {
                var calPrice = (parseInt(item.Price) * parseInt(item.Quantity)).toLocaleString(window.document.documentElement.lang)
                htmlInner = htmlInner + ("<tr>" +
                    "<td>" + item.ProductName + "</td>" +
                    "<td>" + item.Price + "</td>" +
                    "<td>" + item.Quantity + "</td>" +
                    "<td class='text-right'>" + calPrice + " VND</td>" +
                    "</tr>");
            });
            console.log(htmlInner)
        }

        $('#orderDetailModal-title').text("Hóa đơn bàn: " + tableName)
        $('#orderDetailModal-list table tbody').html(htmlInner);

        htmlInner = "<tr><td class='text-right' colspan=4>Tổng tiền: " + total.toLocaleString(window.document.documentElement.lang) + " VND</td></tr>"
        $('#orderDetailModal-list table tfoot').html(htmlInner);
        $('#orderDetailModal').modal('show');
    });
}