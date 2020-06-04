package com.service;

import com.dao.DepartmentMapper;
import com.entity.Department;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @program: ssmTest1
 * @description:
 * @version: 1.0
 * @author: Jia_Q
 * @create: 2020-06-03 10:28
 **/
@Service
public class DepartmentService {
    @Autowired
    DepartmentMapper departmentMapper;

    public List<Department> getDepts() {
        List<Department> list = departmentMapper.selectByExample(null);
        return list;
    }
}
