$(document).ready(function () {

    /*--------页面加载完成以后，直接去发送ajax请求,要到分页数据-------*/
    $(function () {
        //去首页
        to_Page(1);
    });


    /*----------点击新增按钮弹出模态框----------*/
    $("#emp_add_modal_btn").click(function () {
        //清楚表单数据(表单完整重置(表单数据及样式))
        reset_form("#empAddModal form");
        //发出ajax请求，查出部门信息 显示在下拉列表中
        getDepts("#empAddModal select");
        //弹出模态框
        $("#empAddModal").modal({
            backdrop: false
        });
    });

    /*--------为保存员工信息按钮添加事件--------*/
    $("#emp_save_button").click(function () {
        //判断之前的ajax用户名校验是否成功
        if ($(this).attr("ajax-va") == "error") {
            show_validate_msg("#empName_add_input", "error", "用户名不可用");
            return false;
        }

        //对要提交给服务器的数据进行校验
        /*if (!validate_add_form()) {
            return false;
        }*/

        //1.将模态框中填写的表单数据交给服务器进行保存
        //2.发送ajax请求保存员工
        $.ajax({
            url: "emp",
            type: "POST",
            data: $("#empAddModal form").serialize(),
            success: function (result) {
                // alert(result.msg);
                if (result.code == 100) {
                    //员工保存成功；
                    //1、关闭模态框
                    $("#empAddModal").modal('hide');
                    //2、来到最后一页，显示刚才保存的数据
                    //发送ajax请求显示最后一页数据即可
                    to_Page(totalRecord);
                } else {
                    //显示失败信息
                    //有哪个字段的错误信息就显示哪个字段的；
                    if (undefined != result.extend.errorFields.email) {
                        //显示邮箱错误信息
                        show_validate_msg("#email_add_input", "error", result.extend.errorFields.email);
                    }
                    if (undefined != result.extend.errorFields.empName) {
                        //显示员工名字的错误信息
                        show_validate_msg("#empName_add_input", "error", result.extend.errorFields.empName);
                    }
                }
            }
        });
    });

    /*--------添加用户姓名输入校验--------*/
    $("#empName_add_input").change(function () {
        //发送ajax请求校验用户名是否可用
        var empName = this.value;
        $.ajax({
            url: "checkuser",
            data: "empName=" + empName,
            type: "POST",
            success: function (result) {
                if (result.code == 100) {
                    show_validate_msg("#empName_add_input", "success", result.extend.va_msg);
                    $("#emp_save_button").attr("ajax-va", "success");
                } else {
                    show_validate_msg("#empName_add_input", "error", result.extend.va_msg);
                    $("#emp_save_button").attr("ajax-va", "error");
                }
            }
        });
    });

    //1、我们是按钮创建之前就绑定了click，所以绑定不上。
    //1）、可以在创建按钮的时候绑定。    2）、绑定点击.live()
    //jquery新版没有live，使用on进行替代
    /*--------点击编辑按钮弹出模态框----------*/
    $(document).on("click", ".edit_btn", function () {

        //1、查出部门信息，并显示部门列表
        getDepts("#empUpdateModal select");
        //2、查出员工信息，并显示员工信息
        getEmp($(this).attr("edit-id"));
        //3、把员工的id传递给模态框的更新按钮
        $("#emp_update_button").attr("edit-id", $(this).attr("edit-id"));
        //加载模态框
        $("#empUpdateModal").modal({
            backdrop: "static"
        });
    });


    /*--------为更新员工信息按钮添加事件--------*/
    $("#emp_update_button").click(function () {
        //验证邮箱是否合法
        //1、校验邮箱信息
        var email = $("#email_update_input").val();
        var regEmail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
        if (!regEmail.test(email)) {
            show_validate_msg("#email_update_input", "error", "邮箱格式不正确");
            return false;
        } else {
            show_validate_msg("#email_update_input", "success", "");
        }
        //2、发送ajax请求保存更新的员工数据
        $.ajax({
            url: "emp/" + $(this).attr("edit-id"),
            type: "PUT",
            data: $("#empUpdateModal form").serialize()/*+"&_method=PUT"*/,
            success: function (result) {
                // alert(result.msg);
                //1、关闭对话框
                $("#empUpdateModal").modal("hide");
                console.log(currentPage);
                //2、回到本页面
                to_Page(currentPage);
            }
        })
    });
    //单个删除
    $(document).on("click", ".delete_btn", function () {
        //1.弹出是否确认删除对话框
        var empName = $(this).parents("tr").find("td:eq(2)").text();
        var empId = $(this).attr("del-id");
        if (confirm("确认删除【" + empName + "】吗？")) {
            //确认，发送ajax请求删除即可
            $.ajax({
                url: "emp/" + empId,
                type: "DELETE",
                success: function (result) {
                    alert(result.msg);
                    //回到本页
                    to_Page(currentPage);
                }
            })
        }
    });

    /*----------完成全选/全不选功能----------*/
    $("#check_all").click(function () {
        //attr获取checked是undefined;
        //我们这些dom原生的属性；attr获取自定义属性的值；
        //prop修改和读取dom原生属性的值
        $(".check_item").prop("checked", $(this).prop("checked"));
    });

    /*----------全选按钮根据多选个数进行改变----------*/
    $(document).on("click", ".check_item", function () {
        //判断当前选择中的元素是否5个
        var flag = $(".check_item:checked").length == $(".check_item").length;
        $("#check_all").prop("checked", flag);
    });

    /*----------点击全部删除，就批量删除----------*/
    $("#emp_delete_all_btn").click(function () {
        if ($('#check_all').is(':checked') || $('.check_item').is(':checked')) {
            var empNames = "";
            var del_idstr = "";
            $.each($(".check_item:checked"), function () {
                //组装员工姓名字符串
                empNames += $(this).parents("tr").find("td:eq(2)").text() + ",";
                //组装员工id字符串
                del_idstr += $(this).parents("tr").find("td:eq(1)").text() + "-";
            });
            //去除删除的id多余的，
            empNames = empNames.substring(0, empNames.length - 1);
            //去除删除的id多余的-
            del_idstr = del_idstr.substring(0, del_idstr.length - 1);
            if (confirm("确认删除【" + empNames + "】吗？")) {
                //发送ajax请求删除
                $.ajax({
                    url: "emp/" + del_idstr,
                    type: "DELETE",
                    success: function (result) {
                        alert(result.msg);
                        //回到当前页面
                        to_Page(currentPage);
                    }
                })
            }
        } else {
            alert("请选择您要删除的员工");
        }
    });



});


/*--------清空表单样式及内容函数--------*/
function reset_form(ele) {
    $(ele)[0].reset();
    //清空表单样式
    $(ele).find("*").removeClass("has-error has-success");
    $(ele).find(".help-block").text("");
    // $(ele).find("select").empty();
}

/*--------查出所有的部门信息显示在下拉列表中--------*/
function getDepts(ele) {
    //清空下拉列表的值
    $(ele).empty();
    $.ajax({
        url: "depts",
        type: "GET",
        success: function (result) {
            console.log(result);
            //显示部门信息在下拉列表中
            $.each(result.extend.depts, function () {
                var optionEle = $("<option></option>").append(this.deptName).attr("value", this.deptId);
                optionEle.appendTo(ele);
            });
        }
    });
}

/*--------查出所有的员工信息显示在下拉列表中--------*/
function getEmp(id) {
    $.ajax({
        url: "emp/" + id,
        type: "GET",
        success: function (result) {
            console.log(result);
            var empData = result.extend.emp;
            $("#empName_update_static").text(empData.empName);
            $("#email_update_input").val(empData.email);
            $("#empUpdateModal input[name = gender]").val([empData.gender]);
            $("#empUpdateModal select").val([empData.dId]);
        }
    });
}

/*---------校验提交数据方法---------*/
function validate_add_form() {
    /*====校验姓名信息====*/
    var empName = $("#empName_add_input").val();
    var regName = /(^[a-zA-Z0-9_-]{6,16}$)|(^[\u2E80-\u9FFF]{2,5})/;
    //判断姓名是否为空
    if (empName == "") {
        // alert("请输入要添加的姓名>_<");
        show_validate_msg("#empName_add_input", "error", "请输入要添加的姓名>_<");
        $("#empName_add_input").focus();
        return false;
    } else {
        show_validate_msg("#empName_add_input", "success", "");
    }
    /*判断姓名格式是否正确，利用正则表达式*/
    /*
        if (!regName.test(empName)) {
            show_validate_msg("#empName_add_input", "error", "用户名只能是2-5位中文或6-16位英文和数字的组合哟>_<");
            return false;
        } else {
            show_validate_msg("#empName_add_input", "success", "");
        }
    */

    /*====校验邮箱信息====*/
    var email = $("#email_add_input").val();
    var regEmail = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
    //判断邮箱是否为空
    if (email == "") {
        show_validate_msg("#email_add_input", "error", "请输入要添加的邮箱>_<");
        $("#email_add_input").focus();
        return false;
    } else {
        show_validate_msg("#email_add_input", "success", "");
    }
    /*判断邮箱格式是否正确，利用正则表达式*/
    if (!regEmail.test(email)) {
        show_validate_msg("#email_add_input", "error", "邮箱格式不正确>_<");
        return false;
    } else {
        show_validate_msg("#email_add_input", "success", "");
    }
    return true;
}

/*--------校验信息提示方法-------*/
function show_validate_msg(ele, status, msg) {
    //清空当前元素的校验状态
    $(ele).parent().removeClass("has-success has-error");
    $(ele).next("span").text("");
    if ("success" == status) {
        $(ele).parent().addClass("has-success");
        $(ele).next("span").text(msg);
    } else if ("error" == status) {
        $(ele).parent().addClass("has-error");
        $(ele).next("span").text(msg);
    }
}


/*--------创建请求url，获取页面数据的函数-------*/

/*====总记录数 当前页面====*/
var totalRecord, currentPage;

function to_Page(pn) {
    $.ajax({
        url: "emps",
        data: "pn=" + pn,
        type: "GET",
        success: function (result) {
            // console.log(result);
            //1、解析并显示员工数据
            build_emps_table(result);
            //2、解析并显示分页信息
            build_page_info(result);
            //3、解析显示分页条数据
            build_page_nav(result);
        }
    });
}


/*--------解析并显示员工数据-------*/
function build_emps_table(result) {
    //清空table表格
    $("#emps_table tbody").empty();

    //result为Msg对象 里面有code msg 和 extend(存储pageInfo)属性
    var emps = result.extend.pageInfo.list;
    $.each(emps, function (index, item) {
        // alert(item.empName);
        var checkBoxTd = $("<td><input type='checkbox' class='check_item'/></td>");
        var empIdTd = $("<td></td>").append(item.empId);
        var empNameTd = $("<td></td>").append(item.empName);
        var genderTd = $("<td></td>").append(item.gender == "M" ? "男" : "女");
        var emailTd = $("<td></td>").append(item.email);
        var deptNameTd = $("<td></td>").append(item.department.deptName);

        var editBtn = $("<button></button>").addClass("btn btn-primary btn-sm edit_btn").css("margin-right", "10px").css("height", "30px")
            .append($("<span></span>").addClass("glyphicon glyphicon-pencil").append("编辑"));
        //为编辑按钮添加一个自定义的属性，来表示当前员工id
        editBtn.attr("edit-id", item.empId);

        var delBtn = $("<button></button>").addClass("btn btn-danger btn-sm delete_btn")
            .append($("<span></span>").addClass("glyphicon glyphicon-trash")).append("删除");
        //为删除按钮添加一个自定义的属性，来表示当前员工id
        delBtn.attr("del-id", item.empId);

        var btnTd = $("<td></td>").append(editBtn).append(delBtn);
        //append方法执行完成以后还是返回原来的元素
        $("<tr></tr>").append(checkBoxTd)
            .append(empIdTd)
            .append(empNameTd)
            .append(genderTd)
            .append(emailTd)
            .append(deptNameTd)
            .append(btnTd)
            .appendTo("#emps_table tbody");
    });
    //清空table表格
}


/*--------解析显示分页信息--------*/
function build_page_info(result) {
    //清空分页信息
    $("#page_info_area").empty();
    $("#page_info_area").append(" 当前" + result.extend.pageInfo.pageNum + "页,总"
        + result.extend.pageInfo.pages + "页,总"
        + result.extend.pageInfo.total + "条记录");
    totalRecord = result.extend.pageInfo.total;
    currentPage = result.extend.pageInfo.pageNum;
}


/*--------解析显示分页条--------*/
function build_page_nav(result) {
    //清空分页条
    $("#page_nav_area").empty();

    //创建ul
    var ul = $("<ul></ul>").addClass("pagination");

    //创建首页和上一页
    var firstPageLi = $("<li></li>").append($("<a></a>").append("首页").attr("href", "#"));
    var prePageLi = $("<li></li>").append($("<a></a>").append("&laquo;"));
    //如果为第一页添加禁止点击的样式
    if (result.extend.pageInfo.hasPreviousPage == false) {
        // firstPageLi.addClass("disabled");
        prePageLi.addClass("disabled");
    } else {
        //为首页和上一页添加翻页的事件
        firstPageLi.click(function () {
            to_Page(1);
        });
        prePageLi.click(function () {
            to_Page(result.extend.pageInfo.pageNum - 1);
        });
    }

    //创建末页和下一页
    var nextPageLi = $("<li></li>").append($("<a></a>").append("&raquo;"));
    var lastPageLi = $("<li></li>").append($("<a></a>").append("末页").attr("href", "#"));
    //如果为最后一页添加禁止点击的样式
    if (result.extend.pageInfo.hasNextPage == false) {
        nextPageLi.addClass("disabled");
        // lastPageLi.addClass("disabled");
    } else {
        //为首页和上一页添加翻页的事件
        nextPageLi.click(function () {
            to_Page(result.extend.pageInfo.pageNum + 1);
        });
        lastPageLi.click(function () {
            to_Page(result.extend.pageInfo.pages);
        });
    }

    /*---------构造导航栏（合并）---------*/
    //添加首页和前一页
    ul.append(firstPageLi).append(prePageLi);
    //1,2,3...给ul添加页码
    $.each(result.extend.pageInfo.navigatepageNums, function (index, item) {
        var numLi = $("<li></li>").append($("<a></a>").append(item));
        //判断当前页 给当前页添加激活样式
        if (result.extend.pageInfo.pageNum == item) {
            numLi.addClass("active");
        }
        //给页码添加点击事件
        numLi.click(function () {
            to_Page(item)
        });
        ul.append(numLi);
    });
    //添加下一页和末页
    ul.append(nextPageLi).append(lastPageLi);
    //把ul加入到nav中
    var navEle = $("<nav></nav>").append(ul);
    //把nav添加都分页条div处
    navEle.appendTo("#page_nav_area");
}










