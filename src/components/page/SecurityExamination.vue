<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i>安全责任考核
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
                <el-button
                           type="warning"
                           icon="el-icon-search"
                           class="handle-del mr10"
                           @click="findTemplates"
                >查找模板</el-button>
                <!--<el-input v-model="query.name" placeholder="名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>-->
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
                    ref="multipleTable"
                    header-cell-class-name="table-header"
            >
                <el-table-column
                        label="序号"
                        type="index"
                        width="50"
                        align="center">
                    <template scope="scope">
                        <span>{{(query.pageIndex - 1) * query.pageSize + scope.$index + 1}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="名称"></el-table-column>
                <el-table-column prop="filename" label="文件名称"></el-table-column>
                <el-table-column prop="createDate" label="上传日期" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="beginDate" label="有效期开始" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="endDate" label="有效期结束" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="230" fixed="right" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-download"
                                class="download"
                                @click="download(scope.$index, scope.row)"
                        >下载</el-button>
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
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%">
            <el-form ref="editForm" :rules="rules" :model="editableForm" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editableForm.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="文件">
                    <el-upload style="display: none;"
                               :action="modifyUrl"
                               :file-list="fileList"
                               :auto-upload="false"
                               ref="uploadFileEdit"
                               :data="form"
                               :accept="ext"
                               :on-change="handleChange"
                               :on-success="handleUpdateSuccess"
                               :before-upload="beforeAvatarUpload"
                               :headers="headers">
                        <el-button size="small" ref="uploadBtn" slot="trigger" type="primary">导入</el-button>
                    </el-upload>
                    <div>
                        <el-button size="small"  type="primary" @click="fileupload_edit">点击上传</el-button>
                        <div v-html="filename"></div>

                    </div>
                </el-form-item>
                <el-form-item label="有效期开始" >
                    <el-date-picker
                            v-model="editableForm.beginDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="有效期截止" >
                    <el-date-picker
                            v-model="editableForm.endDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea"  maxlength="500" v-model="editableForm.note"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false;editableForm=JSON.parse(JSON.stringify(form));">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%" >
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="文件">
                    <el-upload style="display: none;"
                               :action="uploadUrl"
                               :file-list="fileList"
                               :auto-upload="false"
                               ref="uploadFile"
                               :data="form"
                               :accept="ext"
                               :on-change="handleChange"
                               :on-success="handleAvatarSuccess"
                               :before-upload="beforeAvatarUpload"
                               :headers="headers">
                        <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">导入</el-button>
                    </el-upload>
                    <div>
                        <el-button size="small"  type="primary" @click="upload">点击上传</el-button>
                        <div v-html="filename"></div>

                    </div>
                </el-form-item>
                <el-form-item label="有效期开始" >
                    <el-date-picker
                            v-model="form.beginDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="有效期截止" >
                    <el-date-picker
                            v-model="form.endDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea"  maxlength="500" v-model="form.note"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="resetForm">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>

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
    import {getDate} from "../common/utils";
    import {validateUploadFile} from "../common/validate";
    export default {
        name: 'basetable',
        data() {
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
                fileList:[],
                filename:'',
                templatesData:[],
                templateVisible:false,
                templates: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageTotal:0
                },
                template:{},
                templatesVisible:false,
                isSelectUploadFile:false,
                roleId:'',
                headers:{
                    token : localStorage.getItem("token")
                },
                imageUrl:'',
                ext:'.doc,.docx,.jpg,.jpeg,.bmp,.rar,.zip,.png,.pdf',
                baseUrl:'',
                tableData: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                haveOrg:false,
                form: {},
                editableForm: {},
                idx: -1,
                id: -1,
                imgUrl:'',
                rules:{
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
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
            this.uploadUrl = this.$baseURL + "/securityExamination/securityExamination";
            this.modifyUrl = this.$baseURL + "/securityExamination/updateSecurityExamination";
            this.getData();
        },
        methods: {
            downloadTemplate(index,row){
                //window.location.href=this.$baseURL + "/" + row.url;
                window.open(this.$baseURL + "/" + row.url);
            },
            //查找模板
            findTemplates(){
                this.$axios.get("/securityExaminationTemplate/securityExaminationTemplatesByPage",{
                    params:{
                        page:this.templates.pageIndex,
                        limit:this.templates.pageSize
                    }
                }).then(res => {
                    this.templatesData = res.data.data;
                    this.templates.pageTotal = res.data.count;
                    this.templatesVisible = true;
                }).catch(error => console.log(error));
            },
            fileupload_edit(){
                this.$refs.uploadBtn.$el.click();
            },
            upload(){
                this.$refs.fileUploadBtn.$el.click();
            },
            download(index,row){
                //window.location.href=this.$baseURL + "/" + row.url;
                window.open(this.$baseURL + "/" + row.url);
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            handleChange(file,fileList){
                this.filename = file.name;
                this.isSelectUploadFile = true;
                this.fileList = fileList.slice(-1);
            },
            handleAvatarSuccess(res, file) {
                this.addVisible= false;
                this.getData();
                this.$refs.uploadFile.clearFiles();
                this.isSelectUploadFile = false;
            },
            handleUpdateSuccess(res, file) {
                this.editVisible= false;
                this.getData();
                this.$refs.uploadFileEdit.clearFiles();
                this.isSelectUploadFile = false;
                this.$refs.editForm.clearValidate();
            },
            beforeAvatarUpload(file) {
                const isLt5M = file.size / 1024 / 1024 < 5;
                const isJPG = file.type === 'image/jpeg';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';
                const isWord = (file.type === 'application/msword' || file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                const isPdf = file.type==='application/pdf';
                const isRar = (file.type==='application/octet-stream' || file.type==='');
                const isZip = file.type==='application/x-zip-compressed';
                if(!isJPG && !isPNG && !isBMP && !isWord && !isPdf && !isRar && !isZip){
                    this.$message.error('上传文件支持的类型：jpg、png、bmp、doc、docx、pdf、rar、zip!');
                    return false;
                }
                if (!isLt5M) {
                    this.$message.error('上传文件大小不能超过 5MB!');
                    return false;
                }
                return true;
            },
            getData() {
                this.$axios.get("/securityExamination/securityExaminationsByPage", {
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
                        this.$axios.delete("/securityExamination/securityExamination/" + row .id).then(res => {
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
                this.editVisible = true;
                this.filename = row.filename;
                this.isSelectUploadFile = false;

                if(row.beginDate){
                    this.form.beginDate = getDate(new Date(row.beginDate));
                    this.editableForm.beginDate = getDate(new Date(row.beginDate));
                }
                if(row.endDate){
                    this.form.endDate = getDate(new Date(row.endDate));
                    this.editableForm.endDate = getDate(new Date(row.endDate));
                }
            },
            handleAdd(){
                this.addVisible = true;
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
                this.form = {};
                this.filename='';
                this.fileList=[];
            },
            // 保存编辑
            saveEdit() {
                this.form = JSON.parse(JSON.stringify(this.editableForm));
                this.$refs.editForm.validate(validate => {
                    if (validate) {
                        if(this.isSelectUploadFile)
                            this.$refs.uploadFileEdit.submit();
                        else{
                            this.$axios.post("/securityExamination/updateSecurityExaminationNoFile",this.$qs.stringify(this.form))
                                .then(res=>{
                                    this.editVisible = false;
                                    this.getData();
                                    this.isSelectUploadFile=false;
                                }).catch(error=>console.log(error))
                        }

                        this.$refs.editForm.clearValidate();
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
                this.imageUrl = '';
            },
            // 保存新增
            saveAdd() {
                if(!validateUploadFile(this.fileList)){
                    this.$message.error("请选择上传文件!");
                    return false;
                }
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate => {
                    if (validate) {
                        //触发组件的action
                        this.$refs.uploadFile.submit();
                    } else {
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
</style>
