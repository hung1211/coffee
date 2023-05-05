function isNumberKey(evt, e) {
	var charCode = (evt.which) ? evt.which : evt.keyCode
	if (charCode > 31 && (charCode < 48 || charCode > 57))
		return false;
}


Date.prototype.GetFirstDayOfYear = function() {
    return new Date(this.getFullYear(), 0, 1);
}
Date.prototype.GetLastDayOfYear = function() {
    return new Date(this.getFullYear(), 12, 0);
}

Date.prototype.GetFirstDayOfMonth = function() {
    return new Date(this.getFullYear(), this.getMonth(), 1);
}
Date.prototype.GetLastDayOfMonth = function() {
    return new Date(this.getFullYear(), this.getMonth() + 1, 0);
}

Date.prototype.GetFirstDayOfWeek = function() {
    return (new Date(this.setDate(this.getDate() - this.getDay()+ (this.getDay() == 0 ? -6:1) )));
}
Date.prototype.GetLastDayOfWeek = function() {
    return (new Date(this.setDate(this.getDate() - this.getDay() +7)));
}

function getDateFromString(s){
	var dateParts = s.split("/");
	if(dateParts.length==3){
		return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
	}
	return undefined;
}

function getTimeString(datetime) {
	return (datetime.getHours().toString().length>1?'':'0') + datetime.getHours() + ':' + (datetime.getMinutes().toString().length>1?'':'0') + datetime.getMinutes() + '';
}

function getDateForPrint(datetime) {
	return datetime.getDate() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getFullYear()
}

function getDateAndMonth(datetime) {
	return datetime.getDate() + '-' + (datetime.getMonth() + 1)
}
function getFullDateTimeString(datetime) {
	return datetime.getFullYear() + '-' + (datetime.getMonth() + 1) + '-' + datetime.getDate() + ' ' +
		datetime.getHours() + ':' + datetime.getMinutes() + ':' + datetime.getSeconds();
}

function showLoading(time) {
	$('#loadingPage').show();
	if (time != undefined)
		setTimeout(function () { hideLoading() }, time);
}

function hideLoading() {
	$('#loadingPage').hide();
}