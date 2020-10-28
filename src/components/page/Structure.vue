<template>
    <div style="overflow: auto;">
        <div>
            <div class="crumbs">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item>
                        <i class="el-icon-lx-cascades"></i> 部门管理
                    </el-breadcrumb-item>
                </el-breadcrumb>
            </div>
            <div class="container">
                <div class="handle-box">
                    <el-button
                            type="primary"
                            icon="el-icon-plus"
                            class="handle-del mr10"
                            @click="handleAdd"
                    >新增</el-button>
                    <el-input v-model="query.name" placeholder="部门名称" class="handle-input mr10"></el-input>
                    <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                </div>
                <el-table
                        ref="deptTable"
                        :data="departments"
                        style="width: 100%;height:80%;"
                        row-key="id"
                        border
                        highlight-current-row
                        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
                        @row-click="handleCurrentChange">
                    <el-table-column prop="name" label="部门名称"></el-table-column>
                    <el-table-column prop="tel" label="部门电话"></el-table-column>
                    <el-table-column prop="business" label="部门职能"></el-table-column>
                    <el-table-column label="操作" width="180" align="center">
                        <template slot-scope="scope">
                            <el-button
                                    type="text"
                                    icon="el-icon-edit"
                                    @click="handleEdit(scope.$index, scope.row)"
                            >编辑</el-button>
                            <el-button
                                    type="text"
                                    icon="el-icon-delete"
                                    class="red"
                                    @click="handleDelete(scope.$index, scope.row)"
                            >删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination" style="margin-bottom: -20px;">
                    <el-pagination
                            background
                            layout="total, prev, pager, next"
                            :current-page="query.pageIndex"
                            :page-size="query.pageSize"
                            :total="pageTotal"
                            @current-change="handlePageChange"
                    ></el-pagination>
                </div>
            </div>
            <!-- 编辑弹出框 -->
            <el-dialog title="编辑" :visible.sync="editVisible" width="40%" @open="loadSelectData" @close="closeDialog">
                <el-form ref="form" :rules="rules" :model="editableForm" label-width="70px">
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="editableForm.name" maxlength="30"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="部门电话" prop="tel">
                                <el-input v-model="editableForm.tel" maxlength="20"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" >
                        <el-col >
                            <el-form-item label="父部门">
                                <el-cascader  v-model="pids"
                                              :options="depts"
                                              :props="{label:'name',value:'id',checkStrictly: true}"
                                              clearable
                                ></el-cascader>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" >
                        <el-col >
                            <el-form-item label="部门职能">
                                <el-input type="textarea" maxlength="200" show-word-limit v-model="editableForm.business"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false;editableForm=JSON.parse(JSON.stringify(form));">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 新增弹出框 -->
            <el-dialog title="新增" :visible.sync="addVisible" width="40%"
                       @open="loadSelectData" @close="closeDialog">
                <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="form.name" maxlength="30"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="部门电话" prop="tel">
                                <el-input v-model="form.tel" maxlength="20"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" >
                        <el-col >
                            <el-form-item label="父部门">
                                <el-cascader  v-model="pids" style="width:100%;"
                                              :options="depts"
                                              :props="{label:'name',value:'id',checkStrictly: true}"
                                              clearable
                                ></el-cascader>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" >
                        <el-col >
                            <el-form-item label="部门职能">
                                <el-input type="textarea" maxlength="200" v-model="form.business"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
            </el-dialog>
        </div>
        <!--职位管理-->
        <div>
            <div class="crumbs">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item>
                        <i class="el-icon-lx-cascades"></i> 职位管理
                    </el-breadcrumb-item>
                </el-breadcrumb>
            </div>
            <div class="container">
                <div class="handle-box">
                    <el-button
                            type="primary"
                            icon="el-icon-plus"
                            class="handle-del mr10"
                            @click="handlePositionAdd"
                    >新增</el-button>
                    <!-- <el-input v-model="query.name" placeholder="名称" class="handle-input mr10"></el-input>
                     <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>-->
                </div>
                <el-table
                        :data="positions"
                        style="width: 100%;"
                        row-key="id"
                        border
                >
                    <el-table-column prop="name" label="职位名称"></el-table-column>
                    <el-table-column prop="department.name" label="所在部门"></el-table-column>
                    <el-table-column prop="note" label="职位描述"></el-table-column>
                    <el-table-column label="操作" width="180" align="center">
                        <template slot-scope="scope">
                            <el-button
                                    type="text"
                                    icon="el-icon-edit"
                                    @click="handlePositionEdit(scope.$index, scope.row)"
                            >编辑</el-button>
                            <el-button
                                    type="text"
                                    icon="el-icon-delete"
                                    class="red"
                                    @click="handlePositionDelete(scope.$index, scope.row)"
                            >删除</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <div class="pagination" style="margin-bottom: -20px;">
                    <el-pagination
                            background
                            layout="total, prev, pager, next"
                            :current-page="positionQuery.pageIndex"
                            :page-size="positionQuery.pageSize"
                            :total="positionPageTotal"
                            @current-change="handlePositionPageChange"
                    ></el-pagination>
                </div>
            </div>
            <!-- 编辑弹出框 -->
            <el-dialog title="编辑" :visible.sync="editPositionVisible" width="40%" @open="loadSelectData" @close="closeDialog">
                <el-form ref="form" :rules="rules" :model="editableForm" label-width="80px">
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="editableForm.name" maxlength="50"
                                          show-word-limit></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" >
                        <el-col >
                            <el-form-item label="部门">
                                <el-cascader  v-model="deptIds"
                                              :options="depts"
                                              :props="{label:'name',value:'id',checkStrictly: true}"
                                              clearable
                                ></el-cascader>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="管理层">
                                <el-switch
                                        v-model="editableForm.managementLayer"
                                        active-text="是"
                                        inactive-text="否">
                                </el-switch>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" >
                        <el-col >
                            <el-form-item label="职位描述">
                                <el-input type="textarea" maxlength="200" v-model="editableForm.note"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                <el-button @click="editPositionVisible = false;editableForm=JSON.parse(JSON.stringify(form));">取 消</el-button>
                <el-button type="primary" @click="savePositionEdit">确 定</el-button>
            </span>
            </el-dialog>
            <!-- 新增弹出框 -->
            <el-dialog title="新增" :visible.sync="addPositionVisible" width="40%"
                       @open="loadSelectData" @close="closeDialog">
                <el-form ref="form" :rules="rules" :model="form" label-width="80px">
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="所在部门" >
                                <el-input v-model="deptName" :disabled="true"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="名称" prop="name">
                                <el-input v-model="form.name" maxlength="50"
                                          show-word-limit></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg">
                        <el-col>
                            <el-form-item label="管理层">
                                <el-switch
                                        v-model="form.managementLayer"
                                        active-text="是"
                                        inactive-text="否">
                                </el-switch>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-row type="flex" class="row-bg" >
                        <el-col >
                            <el-form-item label="职位描述">
                                <el-input type="textarea" maxlength="200" v-model="form.note"></el-input>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </el-form>
                <span slot="footer" class="dialog-footer">
                <el-button @click="addPositionVisible = false">取 消</el-button>
                <el-button type="primary" @click="savePositionAdd">确 定</el-button>
            </span>
            </el-dialog>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'basetable',
        data() {
            let checkTel=(rule, value, callback) =>{
                if(value){
                    let tel=/^[1][3,4,5,7,8][0-9]{9}$/;
                    let phone = /^((0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/;
                    if (!tel.test(value) && !phone.test(value)) {
                        callback(new Error("有效的电话格式为11位的手机号和合法的座机号,如:0573-82583659"));
                    } else {
                        callback();
                    }
                }else{
                    callback();
                }
            };
            return {
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 5
                },
                positionQuery: {
                    pageIndex: 1,
                    pageSize:5
                },
                pids:[],
                deptIds:[],
                departments: [],
                positions:[],
                depts:[],//级联部门
                editVisible: false,
                editPositionVisible:false,
                addVisible: false,
                addPositionVisible: false,
                pageTotal: 0,
                positionPageTotal: 0,
                form: {},
                editableForm: {},
                row:{},
                deptName:'',
                idx: -1,
                id: -1,
                rules:{
                    name:[{
                        required:true,message:'请输入部门名称',trigger:'blur'
                    }],
                    tel:[{
                        validator:checkTel,trigger:'blur',message:'有效的电话格式为11位的手机号和合法的座机号,如:0573-82583659'
                    }]
                }
            };
        },
        created() {
            this.getData();
        },
        methods: {
            handleAdd(){
                this.addVisible=true;
                this.form = {};
                this.row = {};
                this.pids=[];
                this.$refs.deptTable.setCurrentRow();
            },
            handlePositionAdd(){
                this.form = {};
                if(JSON.stringify(this.row)==="{}"){
                    this.$message.error("请选择部门!");
                }else{
                    this.addPositionVisible = true;
                    this.deptName = this.row.name;
                }
            },
            getPositionByDepartmentId(departmentId){
                this.$axios.get("/position/positionsByPage",{
                    params:{
                        departmentId:departmentId,
                        page:this.positionQuery.pageIndex,
                        limit:this.positionQuery.pageSize
                    }
                }).then(res => {
                    this.positions = res.data.data;
                    this.positionPageTotal = res.data.count;
                }).catch(error => {
                    console.log(error);
                });
            },
            // 点击行
            handleCurrentChange(currentRow) {
                this.row = currentRow;
                this.getPositionByDepartmentId(this.row.id);
            },
            loadSelectData(){
                this.$axios.get("/department/departments").then(res => {
                    this.depts = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
                this.form = {};
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/department/departmentsByPage",{
                    params:{
                        name:this.query.name,
                        page:this.query.pageIndex,
                        limit:this.query.pageSize
                    }
                }).then(res => {
                    this.departments = res.data.data;
                    this.pageTotal = res.data.count;
                }).catch(error => {
                    console.log(error);
                });
            },
            // 触发搜索按钮
            handleSearch() {
                this.$set(this.query, 'pageIndex', 1);
                this.getData();
            },
            // 删除操作
            handleDelete(index, row) {
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/department/department/" + row.id).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.$message.success('删除成功');
                                this.getData();
                                this.getPositionByDepartmentId(this.row.id);
                                this.row = {};
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(error => {
                            console.log(error);
                        })
                    });
            },
            // 删除操作
            handlePositionDelete(index, row){
                this.form=row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/position/position/" + row.id).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.$message.success('删除成功');
                                this.getPositionByDepartmentId(this.row.id);
                            }else{
                                this.$message.error(res.data.result.message);
                            }
                        }) .catch(error =>{
                            console.log(error);
                        });
                    })
                    .catch(() => {});
            },
            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editableForm = JSON.parse(JSON.stringify(this.form));
                this.editVisible = true;
                this.$axios.get("/department/findParent",{
                    params:{
                        id:row.id
                    }
                }).then(res=>{
                    this.pids=res.data;
                }).catch(error=>console.log(error));
            },
            // 编辑操作
            handlePositionEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editableForm = JSON.parse(JSON.stringify(this.form));
                this.editPositionVisible = true;
                if(row.department){
                    this.$axios.get("/department/findParentDepartments",{
                        params:{
                            id:row.department.id
                        }
                    }).then(res=>{
                        console.log(res.data);
                        this.deptIds=res.data;
                    }).catch(error=>console.log(error));
                }
            },
            // 保存编辑
            saveEdit() {
                if(this.pids && this.pids.length>0){
                    this.form.pid = this.pids[this.pids.length-1];
                }
                this.form = this.editableForm;
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.post("/department/updateDepartment" , this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
                        return false;
                    }
                });
            },
            savePositionEdit(){
                if(this.deptIds && this.deptIds.length>0){
                    this.form.departmentId = this.deptIds[this.deptIds.length-1];
                }
                this.form = this.editableForm;
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.post("/position/updatePosition" , this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editPositionVisible = false;
                                this.getPositionByDepartmentId(this.form.department.id);
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
                        return false;
                    }
                });
            },
            savePositionAdd(){
                this.form.departmentId = this.row.id;
                this.$refs.form.validate(validate =>{
                    if(validate){
                        this.$axios.post("/position/position",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addPositionVisible = false;
                                this.getPositionByDepartmentId(this.row.id);
                            }else{
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err =>{
                            console.log(err);
                        });
                    }else{
                        return false;
                    }
                });
            },
            // 保存新增
            saveAdd(){
                if(this.pids && this.pids.length>0){
                    this.form.pid = this.pids[this.pids.length-1];
                    this.form.parentLevel = this.pids.join(",");
                }
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate =>{
                    if(validate){
                        this.$axios.post("/department/department",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                            }else{
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(err =>{
                            console.log(err);
                        });
                    }else{
                        return false;
                    }
                });
            },
            // 分页导航
            handlePageChange(val) {
                this.$set(this.query, 'pageIndex', val);
                this.getData();
            },
            // 分页导航
            handlePositionPageChange(val) {
                this.$set(this.positionQuery, 'pageIndex', val);
                this.getPositionByDepartmentId(this.row.id);
            }
        }
    };
</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-select {
        width: 120px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
    .table {
        width: 100%;
        font-size: 14px;
    }
    .red {
        color: #ff0000;
    }
    .mr10 {
        margin-right: 10px;
    }
    .table-td-thumb {
        display: block;
        margin: auto;
        width: 40px;
        height: 40px;
    }
</style>
