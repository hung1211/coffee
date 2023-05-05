$(document).ready(function () {
    gettable();
    getarea()
    $("#btnAdd").click(function () {
        $("#tableModal h5.modal-title").text('Thêm mới khu vực')
        $("#tableModal").modal('show');
        document.getElementById("tableName").value = ''
        $("#tableName").attr('data-id', '');
        $('#btnDeletetable').hide();
    });

    

});

//Insert table to database
function addtable() {
    const name = document.getElementById("tableName").value;

    var id = $("#tableName").attr('data-id');
    var link = "/admin/addtable?name=" + name;
    if (id.length > 0 && parseInt(id) > 0) {
        link = "/admin/addtable?id=" + id + "&name=" + name;
    }
    $.get(link, function (data, status) {
        if (id.length > 0 && parseInt(id) > 0)
            $.showNotification({
                body: "Sửa thành công",
                duration: 2000,
                type: "success"
            })
        else
            $.showNotification({
                body: "Thêm thành công",
                duration: 2000,
                type: "success"
            })

        $("#tableModal").modal('hide');
        gettable();
    });
}


//Get table Details by ID
function tableDetails(id) {
    $('#btnDeletetable').show();
    $("#tableModal h5.modal-title").text('Sửa tên bàn')

    var link = "/admin/tableDetails?id=" + id;
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        if (_data != undefined) {
            const name = document.getElementById("tableName");

            $(name).val(unescape(_data.TableName));
            $(name).attr('data-id', id);
        }


    });
    $("#tableModal").modal('show');
}

//Delete table
function deletetable() {
    if (!confirm("Bạn có thật sự muốn xóa khu vực này?")) {
        return false;
    } else {
        var id = $("#tableName").attr('data-id');
        if (id.length > 0 && parseInt(id) > 0) {
            var link = "/admin/deletetable?id=" + id;

            $.get(link, function (data, status) {
                $.showNotification({
                    body: "Đã xóa",
                    duration: 2000,
                    type: "warning"
                })
                $("#tableModal").modal('hide');
                gettable();
            });
        }
    }
}

//Get all table then add to select control. If e (selector) = undefined, get all table to list in table page
function gettable() {
    var link = "/admin/gettable"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#tableItem-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                if (item.AreaID > 0) item.css = 'ui-state-hover';
                else item.css = 'drag';
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });

        $('#modules').html(htmlInner);
        $('.table-item').click(function(){
            tableDetails($(this).attr('data-id'));
        })
        callDrag();
    });
}

function gettablebyarea(e) {
    var id = $(e).attr('data-id')
    
    $('#tableareaModal-title').text($(e).attr('data-value'));
    $('#tableareaModal-list').html('');
    var link = "/admin/gettablebyarea?id=" + id
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#tableItem-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                 item.css = 'tableareaModal-item';
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });

        $('#tableareaModal-list').html(htmlInner);
        $('.tableareaModal-item').click(function(){
            if($(this).hasClass('ui-state-hover'))
            $(this).removeClass('ui-state-hover')
            else $(this).addClass('ui-state-hover')
        });
        $("#tableareaModal").modal('show');
    });
}

function editList(){

    const tableareadata = [];
    $.each($('.tableareaModal-item'), function(index, item){
        if($(item).hasClass('ui-state-hover')){
            tableareadata.push($(item).attr('data-id'));
        }
    })
    if(tableareadata.length>0){
        var link = "/admin/updatetablewitharea?ids=" + JSON.stringify(tableareadata);
        $.get(link, function (data, status) {
            if(data=='1') $.showNotification({
                body: "Sửa thành công",
                duration: 2000,
                type: "success"
            })
            else $.showNotification({
                body: "Thất bại",
                duration: 2000,
                type: "danger"
            })
            $("#tableareaModal").modal('hide');
            gettable();
            getarea();

        });
    }
}

function getarea() {
    var link = "/admin/getareafortable"
    $.get(link, function (data, status) {
        var _data = JSON.parse(data)
        var tempHtml = $('#areaItem-template').html();
        var htmlInner = '';
        if (_data != undefined && _data.length > 0)
            $.each(_data, function (index, item) {
                let rendered = Mustache.render(tempHtml, item);
                htmlInner += rendered;
            });

        $('#areaList').html(htmlInner);
        $('.area-item').click(function(){
            gettablebyarea(this)

        })
        callDrop();
    });
}


function callDrag() {
    $('.drag').draggable({
        appendTo: 'body',
        helper: 'clone',
        activeClass: "ui-state-hover",
        drag: function () {
            $('.dropzone').addClass("ui-state-focus")
        },
        stop: function () {
            $('.dropzone').removeClass("ui-state-focus")
        }
    });
}

function callDrop() {
    $('.dropzone').droppable({
        activeClass: 'hover',
        hoverClass: "ui-state-active",
        accept: ":not(.ui-sortable-helper)", // Reject clones generated by sortable
        drop: function (e, ui) {
            var countTag = $(this).find('span.tableCount');
            num = parseInt(countTag.text())
            num++;
            countTag.text(num);
            var tableid = ui.draggable.attr("data-id");
            var araeid = $(this).attr("data-id");
            ui.draggable.addClass('ui-state-hover');
            var dragItem = ui.draggable;
            $(dragItem).draggable('disable')
            updatelocatetable(tableid, araeid);
        }
    }).sortable({
        items: '.drop-item',
        sort: function () {
            // gets added unintentionally by droppable interacting with sortable
            // using connectWithSortable fixes this, but doesn't allow you to customize active/hoverClass options
            $(this).removeClass("active");
        }
    });
}

function updatelocatetable(t, a) {
    var link = "/admin/updatelocatetable?t=" + t + "&a=" + a;
    $.get(link, function (data, status) {
        console.log(data);
    });
}


