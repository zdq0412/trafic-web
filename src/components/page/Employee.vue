<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 企业人员资料
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
                <el-input v-model="query.name" placeholder="人员名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
                    ref="multipleTable"
                    header-cell-class-name="table-header"
            >
                <el-table-column prop="photo" label="大头照" align="center">
                    <template slot-scope="scope">
                        <el-image style="cursor:pointer;"
                                class="table-td-thumb"
                                :src="baseUrl + '/' + scope.row.photo"
                                @click="showPreview(baseUrl + '/' + scope.row.photo)"
                        ></el-image>
                        <!-- :preview-src-list="[baseUrl + '/' +scope.row.photo]"-->
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="sex" label="性别"></el-table-column>
                <el-table-column prop="age" label="年龄"></el-table-column>
                <el-table-column prop="tel" label="联系电话"></el-table-column>
                <el-table-column prop="idnum" label="身份证"></el-table-column>
                <el-table-column prop="department.name" label="所在部门"></el-table-column>
                <el-table-column prop="position.name" label="职务"></el-table-column>
                <el-table-column prop="user.role.name" label="角色"></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="230" fixed="right" align="center">
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
            <div class="pagination">
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
        <el-dialog :visible.sync="dialogVisible">
            <img style="width: 100%;" :src="imgUrl" alt="">
        </el-dialog>
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="editableForm" label-width="70px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="editableForm.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="tel">
                    <el-input v-model="editableForm.tel" maxlength="11"></el-input>
                </el-form-item>
                <el-form-item label="身份证" prop="idnum">
                    <el-input v-model="editableForm.idnum" maxlength="18"></el-input>
                </el-form-item>
                <el-form-item label="大头照">
                    <div>
                        <div>
                            <el-upload
                                    class="avatar-uploader"
                                    ref="upload_edit"
                                    :data="updata"
                                    :action="modifyUrl"
                                    :headers="headers"
                                    accept="image/*"
                                    :auto-upload="false"
                                    :on-change="handlePhotoChange"
                                    :show-file-list="false"
                                    :on-success="handleUpdateSuccess"
                                    :before-upload="beforeAvatarUpload">
                                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                        </div>
                    </div>
                </el-form-item>
                <el-form-item label="所在部门">
                    <el-cascader  v-model="departmentIds"
                                  :options="depts"
                                  :props="{label:'name',value:'id',checkStrictly: true}"
                                  @change="changeDepartment"
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="职务">
                    <el-select v-model="editableForm.positionId" placeholder="请选择">
                        <el-option
                                v-for="item in positions"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" maxlength="200" v-model="editableForm.note"></el-input>
                </el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="editableForm.roleId" @change="$set(editableForm,roleId)">
                        <el-option v-for="item in roles"
                                   :key="item.id"
                                   :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="手机号" prop="tel">
                    <el-input v-model="form.tel" maxlength="11"></el-input>
                </el-form-item>
                <el-form-item label="身份证" prop="idnum">
                    <el-input v-model="form.idnum" maxlength="18"></el-input>
                </el-form-item>
                <el-form-item label="大头照">
                    <div>
                        <el-upload
                                class="avatar-uploader"
                                ref="upload_add"
                                :data="updata"
                                :action="uploadUrl"
                                :headers="headers"
                                accept="image/*"
                                :auto-upload="false"
                                :on-change="handlePhotoChange"
                                :show-file-list="false"
                                :on-success="handleAvatarSuccess"
                                :before-upload="beforeAvatarUpload">
                            <img v-if="imageUrl" :src="imageUrl" class="avatar">
                            <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                        </el-upload>
                    </div>
                </el-form-item>

                <el-form-item label="所在部门">
                    <el-cascader  v-model="departmentIds"
                                  :options="depts"
                                  :props="{label:'name',value:'id',checkStrictly: true}"
                                  clearable
                                  @change="changeDepartment"
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="职务">
                    <el-select v-model="form.positionId" placeholder="请选择">
                        <el-option
                                ref="addPosition"
                                v-for="item in positions"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" maxlength="200" v-model="form.note"></el-input>
                </el-form-item>
                <el-form-item label="角色">
                    <el-select v-model="form.roleId" @change="$set(form,roleId)" style="width:100%;">
                        <el-option v-for="item in roles"
                                   :key="item.id"
                                   :label="item.name"
                                   :value="item.id"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="resetForm">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        name: 'basetable',
        data() {
            let checkTel=(rule, value, callback) =>{
                if(value){
                    let myreg=/^[1][3,4,5,7,8][0-9]{9}$/;
                    if (!myreg.test(value)) {
                        callback(new Error("不是有效的手机号码格式!"));
                    } else {
                        callback();
                    }
                }  else{
                    callback(new Error("请输入手机号"));
                }
            };
            let checkIdNum=(rule,value,callback) => {
                if(value){
                    let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
                    if(!reg.test(value))
                    {
                        callback(new Error("身份证号不合法"));
                    }else{
                        callback();
                    }
                }  else{
                    callback(new Error("请输入身份证号"));
                }
            };
            return {
                query: {
                    name: '',
                    pageIndex: 1,
                    pageSize: 10
                },
                dialogImageUrl:'',
                dialogVisible:false,
                uploadUrl:'',
                modifyUrl:'',
                roleId:'',
                headers:{
                    token : localStorage.getItem("token")
                },
                imageUrl:'',
                baseUrl:'',
                tableData: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                isSelectFile:false,
                positions:[],
                depts:[],
                departmentIds:[],
                form: {},
                editableForm: {},
                idx: -1,
                id: -1,
                roles:[],
                imgUrl:'',
                rules:{
                    name: [
                        { required: true, message: '请输入员工名称', trigger: 'blur' }
                    ],
                    tel:[
                        { required: true, message: '请输入联系电话', trigger: 'blur' },
                        {validator:checkTel,trigger:'blur'}
                    ],
                    idnum:[
                        { required: true, message: '请输入身份证号', trigger: 'blur' },
                        {validator:checkIdNum,trigger:'blur'}
                    ]
                }
            };
        },
        computed:{
            updata:function(){
                return this.form;
            }
        },
        created() {
            this.baseUrl = this.$baseURL;
            this.modifyUrl = this.baseUrl + "/employee/updateEmployee";
            this.uploadUrl = this.$baseURL + "/employee/addEmployee";
            this.getData();
        },
        methods: {
            showPreview(imgUrl){
                this.imgUrl = imgUrl;
                this.dialogVisible = true;
            },
            changeDepartment(value){
                this.$set(this.form,'positionId','');
              this.getPositionByDepartmentId(value[value.length-1]);
            },
            handlePhotoChange(file){
                this.imageUrl=URL.createObjectURL(file.raw);
                this.isSelectFile = true;
            },
            handleAvatarSuccess(res, file) {
                this.isSelectFile = false;
                this.addVisible= false;
                this.getData();
                this.$refs.upload_add.clearFiles();
            },
            handleUpdateSuccess(res, file) {
                if(res.result.resultCode===200){
                    this.editVisible= false;
                    this.getData();
                    this.isSelectFile = false;
                }else{
                    this.$message.error(res.data.result.message);
                }
            },
            beforeAvatarUpload(file) {
                const isLt2M = file.size / 1024 / 1024 < 2;
                const isJPG = file.type === 'image/jpeg';
                const isGIF = file.type === 'image/gif';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';

                if (!isJPG && !isGIF && !isPNG && !isBMP) {
                    this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!');
                }
                if (!isLt2M) {
                    this.$message.error('上传头像图片大小不能超过 2MB!');
                }
                return true;
            },
            getPositionByDepartmentId(departmentId){
                this.$axios.get("/position/positions",{
                    params:{
                        departmentId:departmentId
                    }
                }).then(res => {
                    this.positions = res.data;
                }).catch(error => {
                    console.log(error);
                });

            },
            //加载下拉选择数据
            loadSelectData() {
                this.$axios.get("/role/roles").then(res => {
                    this.roles = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
                this.$axios.get("/department/departments").then(res => {
                    this.depts = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            getData() {
                this.$axios.get("/employee/employeesByPage", {
                    params: {
                        page: this.query.pageIndex,
                        limit: this.query.pageSize,
                        name: this.query.name
                    }
                }).then(res => {
                    this.tableData = res.data.data;
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
                this.form = row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/employee/employee/" + this.form.id).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.$message.success('删除成功');
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
                            }
                        }).catch(error => {
                            console.log(error);
                        });
                    })
                    .catch(() => {
                    });
            },
            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editableForm = JSON.parse(JSON.stringify(this.form));
                if(this.form.photo) {
                    this.imageUrl =this.$baseURL + "/" + this.form.photo;
                }else{
                    this.imageUrl = '';
                }
                this.editVisible = true;
                if (row.user) {
                    if(row.user.role){
                        this.editableForm.roleId = row.user.role.id;
                    }
                }
                this.isSelectFile = false;

                if(row.department){
                    this.$axios.get("/department/findParentDepartments",{
                        params:{
                            id:row.department.id
                        }
                    }).then(res=>{
                        this.departmentIds=res.data;
                        if(row.position){
                            this.$axios.get("/position/positions",{
                                params:{
                                    departmentId:row.department.id
                                }
                            }).then(res => {
                                this.positions = res.data;
                            }).catch(error => {
                                console.log(error);
                            });
                        }
                    }).catch(error=>console.log(error));
                }

                if(row.position){
                    this.editableForm.positionId = row.position.id;
                }
            },
            handleAdd(){
                this.addVisible = true;
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
                this.form = {};
                this.imageUrl = '';
                this.isSelectFile = false;
            },
            // 保存编辑
            saveEdit() {
                this.form = this.editableForm;
                if(this.departmentIds && this.departmentIds.length>0){
                    this.form.departmentId=this.departmentIds[this.departmentIds.length-1];
                }
                this.$refs.form.validate(validate => {
                    if (validate) {
                        if(this.isSelectFile) {
                            this.$refs.upload_edit.submit();
                        }else{
                            this.$axios.post("/employee/updateEmployeeNoPhoto",this.$qs.stringify(this.form)).then(res=>{
                                this.editVisible= false;
                                this.getData();
                                this.isSelectFile = false;
                            }).catch(error=>{
                                console.log(error);
                            });
                        }
                    } else {
                        return false;
                    }
                });
            },
            resetForm() {
                this.addVisible = false;
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
                this.fileList = [];
                this.imageUrl = '';
            },
            // 保存新增
            saveAdd() {
                if(this.departmentIds && this.departmentIds.length>0){
                    this.form.departmentId=this.departmentIds[this.departmentIds.length-1];
                }
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate => {
                    if (validate) {
                        //触发组件的action
                       if(this.isSelectFile){
                            this.$refs.upload_add.submit();
                        }else{
                            this.$axios.post("/employee/addEmployeeNoPhoto",this.$qs.stringify(this.form)).then(res=>{
                                if(res.data.result.resultCode!=200){
                                    this.$message.error(res.data.result.message);
                                }else{
                                    this.addVisible= false;
                                    this.getData();
                                    this.isSelectFile = false;
                                }

                            }).catch(error=>{
                                console.log(error);
                            });
                        }
                    } else {
                        return false;
                    }
                });
            },
            // 分页导航
            handlePageChange(val) {
                this.$set(this.query, 'pageIndex', val);
                this.getData();
            }
        }
    };
</script>
<style scoped>
    .handle-box {
        margin-bottom: 20px;
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
    .avatar-uploader ,.el-upload{
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        width:100px;
        height:100px;
    }
    .avatar-uploader:hover,.el-upload:hover {
        border-color: #409EFF;
    }
    .avatar-uploader-icon {
        font-size: 28px;
        color: #8c939d;
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        float: left;
    }
    .table-td-thumb {
        display: block;
        margin: auto;
        width: 40px;
        height: 40px;
    }
    .avatar{
        width: 100px;
        height: 100px;
        line-height: 100px;
        text-align: center;
        float: left;
    }
</style>
