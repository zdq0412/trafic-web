<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i>四不放过记录模板
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
                <!--<el-input v-model="query.name" placeholder="模板名称" class="handle-input mr10"></el-input>
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
                <el-table-column prop="orgCategory.name" label="企业类别"></el-table-column>
                <el-table-column prop="province.name" label="省"></el-table-column>
                <el-table-column prop="city.name" label="市"></el-table-column>
                <el-table-column prop="region.name" label="区"></el-table-column>
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
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="70px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
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
                <el-row type="flex" class="row-bg" v-if="!haveOrg">
                    <el-col >
                        <el-form-item label="省市区">
                            <el-cascader
                                    v-model="form.area"
                                    :options="areas"
                                    :props="{label:'name',value:'id',checkStrictly: true}"
                                    @change="handleAreaChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="!haveOrg">
                    <el-col>
                        <el-form-item label="企业类别">
                            <el-select v-model="form.orgCategoryId" placeholder="请选择" style="width: 100%;"  @change="$set(form,orgCategoryId)">
                                <el-option
                                        v-for="item in orgCategories"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="备注">
                    <el-input type="textarea"  maxlength="500"  v-model="form.note"></el-input>
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
                <el-row type="flex" class="row-bg" v-if="!haveOrg">
                    <el-col >
                        <el-form-item label="省市区">
                            <el-cascader
                                    v-model="form.area"
                                    :options="areas"
                                    :props="{label:'name',value:'id',checkStrictly: true}"
                                    @change="handleAreaChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="!haveOrg">
                    <el-col>
                        <el-form-item label="企业类别">
                            <el-select v-model="form.orgCategoryId" placeholder="请选择" style="width: 100%;" >
                                <el-option
                                        v-for="item in orgCategories"
                                        :key="item.id"
                                        :label="item.name"
                                        :value="item.id">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="备注">
                    <el-input type="textarea"  maxlength="500"  v-model="form.note"></el-input>
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
                filename:'',
                isSelectUploadFile:false,
                roleId:'',
                fileList:[],
                headers:{
                    token : localStorage.getItem("token")
                },
                imageUrl:'',
                org:{},
                orgCategories:[],
                areas:[],
                ext:'.doc,.docx,.jpg,.jpeg,.bmp,.rar,.zip,.png,.pdf',
                baseUrl:'',
                tableData: [],
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                haveOrg:false,
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
            this.uploadUrl = this.$baseURL + "/fourRecordTemplate/fourRecordTemplate";
            this.modifyUrl = this.$baseURL + "/fourRecordTemplate/updateFourRecordTemplate";
            this.getData();
            this.$axios.get("/user/haveOrg").then(res =>{
                if(res.data.data){
                    this.haveOrg = true;
                    this.org = res.data.data;
                }
            }).catch(error=>console.log(error));
        },
        methods: {
            loadSelectData(){
                this.$axios.get("/orgCategory/orgCategorys").then(res => {
                    this.orgCategories = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
                this.$axios.get("/category/categorys",{
                    params:{
                        type:'区域'
                    }
                }).then(res => {
                    this.areas = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            fileupload_edit(){
                this.$refs.uploadBtn.$el.click();
            },
            upload(){
                this.$refs.fileUploadBtn.$el.click();
            },
            downloadTemplate(index,row){
               // window.location.href=this.$baseURL + "/" + row.url;
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
            handleAreaChange(){
                if(this.form.area&&this.form.area.length>0){
                    this.form.provinceId=this.form.area[0];
                    if(this.form.area.length==1){
                        this.form.cityId='';
                        this.form.regionId='';
                    }
                    if(this.form.area.length==2){
                        this.form.cityId=this.form.area[1];
                        this.form.regionId='';
                    }
                    if(this.form.area.length==3){
                        this.form.cityId=this.form.area[1];
                        this.form.regionId=this.form.area[2];
                    }
                }
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
                this.$axios.get("/fourRecordTemplate/fourRecordTemplatesByPage", {
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
                        this.$axios.delete("/fourRecordTemplate/fourRecordTemplate/" + row.id).then(res => {
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
                this.editVisible = true;
                this.filename = row.filename;
                this.isSelectUploadFile = false;

                if(row.orgCategory){
                    this.form.orgCategoryId = row.orgCategory.id;
                }
                if(row.province && row.city && row.region){
                    this.form.area=[row.province.id,row.city.id,row.region.id];
                    this.form.provinceId=row.province.id;
                    this.form.cityId = row.city.id;
                    this.form.regionId = row.region.id;
                }else if(row.province && row.city){
                    this.form.area=[row.province.id,row.city.id];
                    this.form.provinceId=row.province.id;
                    this.form.cityId = row.city.id;
                }else if(row.province){
                    this.form.area=[row.province.id];
                    this.form.provinceId=row.province.id;
                }
            },
            handleAdd(){
                this.addVisible = true;
                if (this.$refs.form) {
                    this.$refs.form.resetFields();
                }
                this.form = {};
                this.filename='';
                this.fileList = [];
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        if(this.isSelectUploadFile)
                            this.$refs.uploadFileEdit.submit();
                        else{
                            this.$axios.post("/fourRecordTemplate/updateFourRecordTemplateNoFile",this.$qs.stringify(this.form))
                                .then(res=>{
                                    this.editVisible = false;
                                    this.getData();
                                    this.isSelectUploadFile=false;
                                }).catch(error=>console.log(error))
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
                this.imageUrl = '';
            },
            // 保存新增
            saveAdd() {
                if(!validateUploadFile(this.fileList)){
                    this.$message.error('请选择上传文件!');
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
