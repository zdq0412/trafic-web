<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 安全责任考核模板
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
                <el-input v-model="query.name" placeholder="模板名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
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
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="230" fixed="right" align="center">
                    <template slot-scope="scope">
                        <el-button
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="downloadTemplate(scope.$index, scope.row)"
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
        <el-dialog :visible.sync="dialogVisible">
            <img style="width: 100%;" :src="imgUrl" alt="">
        </el-dialog>
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="文件" prop="uploadFile">
                            <el-upload
                                    class="avatar-uploader"
                                    ref="upload"
                                    :data="updata"
                                    :action="uploadUrl"
                                    :headers="headers"
                                    :accept="ext"
                                    :auto-upload="false"
                                    :on-change="handlePhotoChange"
                                    :show-file-list="false"
                                    :on-success="handleUpdateSuccess"
                                    :before-upload="beforeAvatarUpload">
                                <img v-if="imageUrl" :src="imageUrl" class="avatar">
                                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                            </el-upload>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="form.note"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="文件">
                    <el-upload
                            class="upload-demo"
                            ref="upload"
                            :data="updata"
                            :action="uploadUrl"
                            :headers="headers"
                            :accept="ext"
                            :limit="1"
                            :auto-upload="false"
                            :show-file-list="true"
                            :on-success="handleAvatarSuccess"
                            :before-upload="beforeAvatarUpload">
                       <!-- <img v-if="imageUrl" :src="imageUrl" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>-->
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传图片、work文档和PDF文件，且不超过5M</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input type="textarea" v-model="form.note"></el-input>
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
    import {getDate} from "../common/utils";

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
                form: {},
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
            this.uploadUrl = this.$baseURL + "/securityExaminationTemplate/securityExaminationTemplate";
            this.getData();
        },
        methods: {
            downloadTemplate(index,row){
                window.location.href=this.$baseURL + "/" + row.url;
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            showPreview(imgUrl){
                this.imgUrl = imgUrl;
                this.dialogVisible = true;
            },
            handlePhotoChange(file){
                this.imageUrl=URL.createObjectURL(file.raw);
            },
            handleAvatarSuccess(res, file) {
                this.addVisible= false;
                this.getData();
                this.$refs.upload.clearFiles();
            },
            handleUpdateSuccess(res, file) {
                this.editVisible= false;
                this.getData();
            },
            beforeAvatarUpload(file) {
                alert(file.type);
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
                    this.$message.error('上传头像图片大小不能超过 5MB!');
                    return false;
                }
                return isJPG && isLt5M;
            },
            getData() {
                this.$axios.get("/securityExaminationTemplate/securityExaminationTemplatesByPage", {
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
                        this.$axios.delete("/securityExaminationTemplate/securityExaminationTemplate/" + this.form.id).then(res => {
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
                if(this.form.photo) {
                    this.imageUrl =this.$baseURL + "/" + this.form.photo;
                }else{
                    this.imageUrl = '';
                }
                this.editVisible = true;
                if (row.user) {
                    if(row.user.role){
                        this.form.roleId = row.user.role.id;
                    }
                }
                if(row.department){
                    this.$axios.get("/department/findParent",{
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
                                this.form.positionId=row.position.id;
                            }).catch(error => {
                                console.log(error);
                            });
                        }
                    }).catch(error=>console.log(error));
                }

            },
            handleAdd(){
                this.addVisible = true;
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
                this.form = {};
                this.imageUrl = '';
            },
            // 保存编辑
            saveEdit() {
                if(this.departmentIds && this.departmentIds.length>0){
                    this.form.departmentId=this.departmentIds[this.departmentIds.length-1];
                }
                this.$refs.form.validate(validate => {
                    if (validate) {
                            this.$refs.upload.submit();
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
                            this.$refs.upload.submit();
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
