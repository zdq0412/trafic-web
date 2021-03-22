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
                <el-button
                        type="warning"
                        class="handle-del mr10"
                        @click="findTemplates"
                >查看人员档案模板</el-button>
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
                        <el-image v-if="scope.row.photo"
                                style="cursor:pointer;"
                                class="table-td-thumb"
                                :src="baseUrl + '/' + scope.row.photo"
                                @click="showPreview(baseUrl + '/' + scope.row.photo)"
                        ></el-image>
                        <img v-else
                                class="table-td-thumb"
                                style="cursor:pointer;"
                                src="../../assets/img/img.jpg"
                               @click="showPreview('')"
                        />
                        <!-- :preview-src-list="[baseUrl + '/' +scope.row.photo]"-->
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="姓名"></el-table-column>
                <el-table-column prop="sex" label="性别"></el-table-column>
                <el-table-column prop="age" label="年龄"></el-table-column>
                <el-table-column prop="tel" label="联系电话"></el-table-column>
                <el-table-column prop="idnum" label="身份证"></el-table-column>
               <!-- <el-table-column prop="department.name" label="所在部门"></el-table-column>
                <el-table-column prop="position.name" label="职务"></el-table-column>-->
                <el-table-column prop="user.role.name" label="角色"></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column  label="人员档案">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                style="color:#E6A23C"
                                @click="upload(scope.$index, scope.row)"
                        >上传</el-button>
                        <el-button v-if="scope.row.archives!=null && scope.row.archives!=''"
                                type="text"
                                @click="download(scope.$index, scope.row)"
                        >预览</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="230" fixed="right" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-user"
                                style="color:#E6A23C"
                                @click="handlePosition(scope.$index, scope.row)"
                        >职务管理</el-button>
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
            <img style="width: 100%;" :src="imgUrl" alt="" v-if="imgUrl!=''">
            <img v-else style="width:100%;" src="../../assets/img/img.jpg" />
        </el-dialog>
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%">
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
                                    action=""
                                    :headers="headers"
                                    accept="image/*"
                                    :auto-upload="false"
                                    :on-change="handlePhotoChange"
                                    :file-list="fileList"
                                    :on-success="handleUpdateSuccess"
                                    :before-upload="beforeAvatarUpload">
                                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                        </div>
                    </div>
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
        <el-dialog title="新增" :visible.sync="addVisible" width="40%" @open="loadSelectData">
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
                                action=""
                                :headers="headers"
                                :file-list="fileList"
                                accept="image/*"
                                :auto-upload="false"
                                :on-change="handlePhotoChange"
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
                                  filterable
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
        <!-- 职务管理对话框 -->
        <el-dialog title="职务管理" :visible.sync="positionDialogVisible" width="40%">
            <div style="height:300px;overflow: auto;">
                <position-tree ref="positionTree" v-if="positionDialogVisible" :paramType="param" :param="employeeId"></position-tree>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="positionDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="savePositions">确 定</el-button>
            </span>
        </el-dialog>

        <el-upload style="display: none;"
                   :action="uploadArchiveUrl"
                   :limit="1"
                   :auto-upload="true"
                   ref="uploadFile"
                   :data="param"
                   :on-success="handleArchiveSuccess"
                   :before-upload="beforeArchiveUpload"
                   :headers="headers">
            <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">导入</el-button>
        </el-upload>

        <!--查看系统模板-->
        <el-dialog title="系统模板" :visible.sync="templatesVisible" width="70%" >
            <el-table
                    :data="templatesData"
            >
                <el-table-column
                        label="序号"
                        type="index"
                        width="50"
                        align="center">
                    <template scope="scope">
                        <span>{{(templates.pageIndex - 1) * templates.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="名称">
                </el-table-column>
                <el-table-column prop="createDate" label="创建日期"  :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="creator"  label="创建人"></el-table-column>
                <el-table-column prop="note" label="备注"  width="150" >
                    <template scope="scope">
                        <span style="cursor: pointer;color:#409EFF;" @click="showNote(scope.row.note)">{{ scope.row.note }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" align="center">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.url"
                                   type="text"
                                   icon="el-icon-download"
                                   style="color:#67C23A"
                                   @click="downloadTemplate(scope.$index, scope.row)"
                        >下载</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                        background
                        layout="total, prev, pager, next"
                        :current-page="templates.pageIndex"
                        :page-size="templates.pageSize"
                        :total="templates.pageTotal"
                        @current-change="handleTemplatesPageChange"
                ></el-pagination>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="templatesVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import PositionTree from '../common/PositionTree';
    import {getDate} from "../common/utils";
    export default {
        components:{
          PositionTree
        },
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

                templatesData:[],
                templateVisible:false,
                templates: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageTotal:0
                },
                template:{},
                templatesVisible:false,

                param:{type:'archive'},
                dialogImageUrl:'',
                dialogVisible:false,
                uploadUrl:'',
                uploadArchiveUrl:'',
                modifyUrl:'',
                employeeId:'',
                roleId:'',
                headers:{
                    token : localStorage.getItem("token")
                },
                file:{},
                positionDialogVisible:false,
                imageUrl:'',
                baseUrl:'',
                fileList:[],
                tableData: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                isSelectFile:false,
                positions:[],
                depts:[],
                departmentIds:[],
                form: {
                },
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
            this.uploadArchiveUrl = this.$baseURL + "/employeeDocumentUpload";
            this.getData();
        },
        methods: {
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            downloadTemplate(index,row){
                //window.location.href=this.$baseURL + "/" + row.url;
                window.open(this.$baseURL + "/" + row.url);
            },
            //查找模板
            findTemplates(){
                this.$axios.get("/empArchivesTemplate/empArchivesTemplatesByPage",{
                    params:{
                        type:'otherDocument',
                        page:this.templates.pageIndex,
                        limit:this.templates.pageSize
                    }
                }).then(res => {
                    this.templatesData = res.data.data;
                    this.templates.pageTotal = res.data.count;
                    this.templatesVisible = true;
                }).catch(error => console.log(error));
            },
            download(index,row){
                window.open(this.$baseURL + "/" + row.archives);
            },
            upload(index,row){
                this.$refs.uploadFile.clearFiles();
                this.param.id=row.id;
                this.$refs.fileUploadBtn.$el.click();
            },
            savePositions(){
                let checkedIds = this.$refs.positionTree.getCheckedKeys();
                let param = new FormData();
                param.append("positionsId",JSON.stringify(checkedIds));
                param.append("employeeId",this.employeeId);
                this.$axios.put("position/employeePositions",param).then(res=>{
                    if(res.data.result.resultCode==200){
                        this.positionDialogVisible = false;
                        this.$message.success("操作成功!");
                    }
                }).catch(error=>{
                    console.log(error);
                });
            },
            showPreview(imgUrl){
                this.imgUrl = imgUrl;
                this.dialogVisible = true;
            },
            changeDepartment(value){
                this.$set(this.form,'positionId','');
              this.getPositionByDepartmentId(value[value.length-1]);
            },
            handlePhotoChange(file,fileList){
                this.imageUrl=URL.createObjectURL(file.raw);
                this.isSelectFile = true;
                this.fileList=fileList.slice(-1);
            },
            handleAvatarSuccess(res, file) {
                if(res.result.resultCode===200){
                    this.isSelectFile = false;
                    this.addVisible= false;
                    this.getData();
                    this.$refs.upload_add.clearFiles();
                }else{
                    this.$message.error(res.result.message);
                    this.$refs.upload_add.clearFiles();
                }
            },
            handleArchiveSuccess(res, file) {
                this.getData();
            },
            handleUpdateSuccess(res, file) {
                if(res.result.resultCode===200){
                    this.editVisible= false;
                    this.getData();
                    this.isSelectFile = false;
                }else{
                    this.$message.error(res.result.message);
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
            beforeArchiveUpload(file) {
                const isLt10M = file.size / 1024 / 1024 < 10;
              /*  const isJPG = file.type === 'image/jpeg';
                const isGIF = file.type === 'image/gif';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';*/
                const isPDF = file.type === 'application/pdf';


                if (!isPDF) {
                    this.$message.error('上传文件必须是PDF格式!');
                    return false;
                }
/*
                if (!isJPG && !isGIF && !isPNG && !isBMP&&!isPDF) {
                    this.$message.error('上传文件必须是JPG/GIF/PNG/BMP/PDF 格式!');
                }
*/
                if (!isLt10M) {
                    this.$message.error('上传文件大小不能超过 10MB!');
                    return false;
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
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/employee/employee/" + row.id).then(res => {
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
            //职务管理
            handlePosition(index,row){
                this.employeeId = row.id;
                this.positionDialogVisible=true;
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
                        this.form.roleId = row.user.role.id;
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
                    this.form.positionId = row.position.id;
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
                this.fileList=[];
            },
            // 保存编辑
            saveEdit() {
                this.form = JSON.parse(JSON.stringify(this.editableForm));
                if(this.departmentIds && this.departmentIds.length>0){
                    this.form.departmentId=this.departmentIds[this.departmentIds.length-1];
                }
                this.$refs.form.validate(validate => {
                    if (validate) {
                        if(this.isSelectFile) {
                            let formData = new FormData();
                            formData.append("id",this.form.id);
                            formData.append("file",this.fileList[0].raw);
                            formData.append("headers",this.headers);
                            formData.append("name",this.form.name);
                            formData.append("limit",this.query.pageSize);
                            formData.append("page",this.query.pageIndex);
                            formData.append("idnum",this.form.idnum);
                            formData.append("tel",this.form.tel);
                            formData.append("note",!this.form.note?'':this.form.note);
                            formData.append("roleId",!this.form.roleId?'':this.form.roleId);
                            formData.append("departmentId",!this.form.departmentId?"":this.form.departmentId);
                            formData.append("positionId",!this.form.positionId?'':this.form.positionId);
                            this.$axios.post("/employee/updateEmployee",formData).then(res=>{
                                if(res.data.result.resultCode!==200){
                                    this.$message.error(res.data.result.message);
                                }else{
                                    this.editVisible= false;
                                    this.getData();
                                    this.isSelectFile = false;
                                    this.fileList=[];
                                }
                            }).catch(error=>console.log(error));
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
                           // this.$refs.upload_add.submit();
                           let formData = new FormData();
                           formData.append("uploadFile",this.fileList[0].raw);
                           formData.append("headers",this.headers);
                           formData.append("name",this.form.name);
                           formData.append("limit",this.query.pageSize);
                           formData.append("page",this.query.pageIndex);
                           formData.append("idnum",this.form.idnum);
                           formData.append("tel",this.form.tel);
                           formData.append("note",!this.form.note?'':this.form.note);
                           formData.append("roleId",!this.form.roleId?'':this.form.roleId);
                           formData.append("departmentId",!this.form.departmentId?"":this.form.departmentId);
                           formData.append("positionId",!this.form.positionId?'':this.form.positionId);
                           this.$axios.post("/employee/addEmployee",formData).then(res=>{
                               if(res.data.result.resultCode!==200){
                                   this.$message.error(res.data.result.message);
                               }else{
                                   this.addVisible= false;
                                   this.getData();
                                   this.isSelectFile = false;
                                   this.fileList=[];
                               }
                           }).catch(error=>console.log(error));
                        }else{
                            this.$axios.post("/employee/addEmployeeNoPhoto",this.$qs.stringify(this.form))
                                .then(res=>{
                                if(res.data.result.resultCode!==200){
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
            }, // 分页导航
            handleTemplatesPageChange(val) {
                this.$set(this.templates, 'pageIndex', val);
                this.findTemplates();
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
