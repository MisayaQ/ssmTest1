<%@ page language="java" contentType="text/html; charset=UTF-8"
         pageEncoding="UTF-8" %>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
<head>
    <title>员工列表</title>
    <%
        String path = request.getContextPath();
        String basePath = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort() + path + "/";
    %>
    <base href="<%=basePath%>">
    <!-- web路径：
            不以/开始的相对路径，找资源，以当前资源的路径为基准，经常容易出问题。
            以/开始的相对路径，找资源，以服务器的路径为标准(http://localhost:3306)；需要加上项目名 http://localhost:3306/crud

     -->
    <%--引入jQuery--%>
    <script src="static/js/jquery.min.js"></script>
    <%--引入样式--%>
    <link href="static/bootstrap/css/bootstrap.min.css" rel="stylesheet">
    <script src="static/bootstrap/js/bootstrap.min.js"></script>
</head>
<body>
<%--搭建显示页面--%>
<div class="container">
    <%--标题--%>
    <div class="row">
        <div class="col-md-12">
            <h1>SSM-CRUD</h1>
        </div>
    </div>

    <%--按钮--%>
    <div class="row">
        <div class="col-md-4 col-md-offset-8">
            <button class="btn btn-primary">新增</button>
            <button class="btn btn-danger">删除</button>
        </div>
    </div>

    <%--显示表格--%>
    <div class="row">
        <div class="col-md-12">
            <table class="table table-hover">
                <tr>
                    <th>#</th>
                    <th>name</th>
                    <th>gender</th>
                    <th>email</th>
                    <th>deptName</th>
                    <th>操作</th>
                </tr>
                <c:forEach items="${pageInfo.list}" var="emp">
                    <tr>
                        <td>${emp.empId}</td>
                        <td>${emp.empName}</td>
                        <td>${emp.gender=="M"?"男":"女"}</td>
                        <td>${emp.email}</td>
                        <td>${emp.department.deptName}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" style="margin-right: 10px;">
                                <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>
                                编辑
                            </button>
                            <button class="btn btn-danger btn-sm">
                                <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
                                删除
                            </button>
                        </td>
                    </tr>
                </c:forEach>

            </table>
        </div>
    </div>

    <%--显示分页信息--%>
    <div class="row">
        <%--分页文字信息--%>
        <div class="col-md-5">
            当前${pageInfo.pageNum}页,总${pageInfo.pages}页,总${pageInfo.total}条记录
        </div>
        <%--分页条--%>
        <div class="col-md-7">
            <nav aria-label="Page navigation">
                <ul class="pagination">
                    <%--首页--%>
                    <li><a href="emps?pn=1">首页</a></li>


                    <%--判断 如果有上一页--%>
                    <c:if test="${pageInfo.hasPreviousPage}">
                        <li>
                            <a href="emps?pn=${pageInfo.pageNum-1}" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </c:if>
                    <%--判断 如果没有上一页 禁用--%>
                    <c:if test="${!pageInfo.hasPreviousPage}">
                        <li class="disabled">
                            <a href="#" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                    </c:if>


                    <%--遍历显示的页码--%>
                    <c:forEach items="${pageInfo.navigatepageNums}" var="page_Num">
                        <%--判断是不是当前页 是的话高亮--%>
                        <c:if test="${page_Num == pageInfo.pageNum}">
                            <li class="active"><a href="#">${page_Num}</a></li>
                        </c:if>
                        <c:if test="${page_Num != pageInfo.pageNum}">
                            <li><a href="emps?pn=${page_Num}">${page_Num}</a></li>
                        </c:if>
                    </c:forEach>


                    <%--判断 如果有下一页--%>
                    <c:if test="${pageInfo.hasNextPage}">
                        <li>
                            <a href="emps?pn=${pageInfo.pageNum+1}" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </c:if>
                    <%--判断 如果没有下一页 禁用--%>
                    <c:if test="${!pageInfo.hasNextPage}">
                        <li class="disabled">
                            <a href="emps?pn=${pageInfo.pages}" aria-label="Next">
                                <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>
                    </c:if>

                    <%--末页--%>
                    <li><a href="emps?pn=${pageInfo.pages}">末页</a></li>
                </ul>
            </nav>
        </div>
    </div>
</div>
</body>
</html>
