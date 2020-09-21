<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 应急预案备案
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button
                        type="primary"
                        icon="el-icon-plus"
                        class="handle-del mr10"
                        @click="addVisible=true;form={};"
                >新增</el-button>
                <!--<el-button
                        type="warning"
                        icon="el-icon-search"
                        class="handle-del mr10"
                        @click="findTemplates"
                >查找模板</el-button>-->
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
                    header-cell-class-name="table-header"
            >
                <el-table-column prop="prePlanName" label="预案名称"></el-table-column>
                <el-table-column prop="writeDate" label="编制时间" :formatter="dateFormatter"></el-table-column>
                <el-table-column label="预案文件">
                    <template slot-scope="scope">
                        <el-upload style="display: none;"
                                   :action="uploadUrl"
                                   :limit="1"
                                   :auto-upload="true"
                                   ref="uploadPreplanFile"
                                   :data="param"
                                   :accept="ext"
                                   :on-success="handleAvatarSuccess"
                                   :before-upload="beforeAvatarUpload"
                                   :headers="headers">
                            <el-button size="small" ref="preplanUploadBtn" slot="trigger" type="primary">导入</el-button>
                        </el-upload>
                        <el-button
                                type="text"
                                icon="el-icon-upload2"
                                class="upload"
                                @click="uploadPreplan(scope.$index, scope.row)"
                        >上传</el-button>
                        <el-button v-if="scope.row.prePlanRealPath"
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="downloadPreplan(scope.$index, scope.row)"
                        >下载</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="keepOnRecordName" label="备案名称"></el-table-column>
                <el-table-column prop="keepOnRecord" label="备案状态">
                    <template slot-scope="scope">
                        <span v-if="!scope.row.keepOnRecord">否</span>
                        <span v-else>是</span>
                    </template>
                </el-table-column>
                <el-table-column prop="keepOnRecordDate" label="备案时间" :formatter="dateFormatter"></el-table-column>
                <el-table-column label="备案文件">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.keepOnRecord"
                                   type="text"
                                   icon="el-icon-upload2"
                                   class="upload"
                                   @click="uploadBak(scope.$index, scope.row)"
                        >上传</el-button>
                        <el-button v-if="scope.row.keepOnRecordRealPath"
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="downloadBak(scope.$index, scope.row)"
                        >下载</el-button>
                    </template>
                </el-table-column>
                <!--<el-table-column label="应急预案演练">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                class="upload"
                                @click="lookup(scope.$index, scope.row)"
                        >查看</el-button>
                    </template>
                </el-table-column>-->
                <el-table-column label="操作" width="280" align="center">
                    <template slot-scope="scope">
                        <el-button
                                v-if="!scope.row.keepOnRecord"
                                type="text"
                                style="color:#E6A23C;"
                                icon="el-icon-paperclip"
                                @click="handlePreplan(scope.$index, scope.row)"
                        >备案</el-button>
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
        <el-upload style="display: none;"
                   :action="uploadUrl"
                   :limit="1"
                   :auto-upload="true"
                   ref="uploadBakFile"
                   :data="param"
                   :accept="ext"
                   :on-success="handleAvatarSuccess"
                   :before-upload="beforeAvatarUpload"
                   :headers="headers">
            <el-button size="small" ref="bakUploadBtn" slot="trigger" type="primary">导入</el-button>
        </el-upload>
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%" @close="closeDialog('editForm')">
            <el-form ref="editForm" :rules="rules" :model="editableForm" label-width="100px">
                <el-form-item label="预案名称" prop="prePlanName">
                    <el-input v-model="editableForm.prePlanName" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="编制日期"  prop="writeDate">
                    <el-date-picker
                            v-model="editableForm.writeDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备案名称" prop="keepOnRecordName" v-if="editableForm.keepOnRecord">
                    <el-input v-model="editableForm.keepOnRecordName" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="备案日期"  v-if="editableForm.keepOnRecord" prop="keepOnRecordDate">
                    <el-date-picker
                            v-model="editableForm.keepOnRecordDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false;editableForm=JSON.parse(JSON.stringify(form));">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%"  @close="closeDialog('form')">
            <el-form ref="form" :model="form" :rules="rules"  label-width="100px">
                <el-form-item label="预案名称" prop="prePlanName">
                    <el-input v-model="form.prePlanName" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="编制日期">
                    <el-date-picker
                            v-model="form.writeDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>

        <!--备案-->
        <el-dialog title="备案" :visible.sync="preplanVisible" width="40%" @close="closeDialog('preplanForm')">
            <el-form ref="preplanForm" :rules="rules" :model="preplanForm" label-width="100px">
                <el-form-item label="备案名称" prop="keepOnRecordName">
                    <el-input v-model="preplanForm.keepOnRecordName" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="备案日期" prop="keepOnRecordDate">
                    <el-date-picker
                            v-model="preplanForm.keepOnRecordDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="preplanVisible = false;preplanForm=JSON.parse(JSON.stringify(form));">取 消</el-button>
                <el-button type="primary" @click="savePreplan">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import {getDate} from "../common/utils";

    export default {
        name: 'basetable',
        data() {
            //编制时间
            let writeDate=(rule, value, callback) =>{
                if(value){
                    if(this.form.keepOnRecordDate){
                        let writeDate = new Date(value);
                        let keepOnRecordDate = new Date(this.form.keepOnRecordDate);
                        if(writeDate.getTime()>=keepOnRecordDate.getTime()){
                            callback(new Error("编制日期不能大于备案日期!"));
                        }else{
                            callback();
                        }
                    }else{
                        callback();
                    }
                }  else{
                    callback();
                }
            };
            let keepOnRecordDate=(rule, value, callback) =>{
                if(value){
                    if(this.form.writeDate){
                        let writeDate = new Date(this.form.writeDate);
                        let keepOnRecordDate = new Date(value);
                        if(writeDate.getTime()>=keepOnRecordDate.getTime()){
                            callback(new Error("备案日期不能小于编制日期!"));
                        }else{
                            callback();
                        }
                    }else{
                        callback();
                    }
                }  else{
                    callback();
                }
            };
            return {
                query: {
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


                uploadUrl:'',
                param:{type:'emergencyPlanBak'},
                headers:{
                    token : localStorage.getItem("token")
                },
                ext:'.doc,.docx,.jpg,.jpeg,.bmp,.rar,.zip,.png,.pdf',
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                preplanVisible: false,
                pageTotal: 0,
                form: {},
                editableForm: {},
                preplanForm:{},
                preplanFormOnly:{},
                idx: -1,
                id: -1,
                rules:{
                    prePlanName: [
                        { required: true, message: '请输入预案名称', trigger: 'blur' }
                    ],
                    keepOnRecordName: [
                        { required: true, message: '请输入备案名称', trigger: 'blur' }
                    ],
                    keepOnRecordDate: [
                        { validator:keepOnRecordDate, trigger: 'blur' }
                    ],
                    writeDate: [
                        { validator:writeDate, trigger: 'blur' }
                    ]
                }
            };
        },
        created() {
            this.uploadUrl = this.$baseURL + "/emergencyPlanBakUpload";
            this.getData();
        },
        methods: {
            lookup(index,row){
                localStorage.setItem("emergencyPlanBakId",row.id);
                this.$router.push({name:"preplanDrillRecord",params:{emergencyPlanBakId:row.id}});
            },
            // 分页导航
            handleTemplatesPageChange(val) {
                this.$set(this.templates, 'pageIndex', val);
                this.findTemplates();
            },
            downloadTemplate(index,row){
                // window.location.href=this.$baseURL + "/" + row.url;
                window.open(this.$baseURL + "/" + row.url);
            },
            //查找模板
            findTemplates(){
                this.$axios.get("/empArchivesTemplate/empArchivesTemplatesByPage",{
                    params:{
                        type:'emergencyPlanBak',
                        page:this.templates.pageIndex,
                        limit:this.templates.pageSize
                    }
                }).then(res => {
                    this.templatesData = res.data.data;
                    this.templates.pageTotal = res.data.count;
                    this.templatesVisible = true;
                }).catch(error => console.log(error));
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            uploadPreplan(index,row){
                this.$refs.uploadPreplanFile.clearFiles();
                this.param.id=row.id;
                this.param.type="emergencyPlanBak";
                this.$refs.preplanUploadBtn.$el.click();
            },
            uploadBak(index,row){
                this.$refs.uploadBakFile.clearFiles();
                this.param.id=row.id;
                this.param.type="planBak";
                this.$refs.bakUploadBtn.$el.click();
            },
            downloadPreplan(index,row){
                // window.location.href=this.$baseURL + "/" + row.prePlanUrl;
                window.open(this.$baseURL + "/" + row.prePlanUrl);
            },
            downloadBak(index,row){
                // window.location.href=this.$baseURL + "/" + row.keepOnRecordUrl;
                window.open(this.$baseURL + "/" + row.keepOnRecordUrl);
            },
            handleAvatarSuccess(res, file) {
                this.$message.success("上传成功!");
                this.getData();
            },
            beforeAvatarUpload(file) {
                const isLt5M = file.size / 1024 / 1024 < 5;
                const isJPG = file.type === 'image/jpeg';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';
                const isWord = (file.type === 'application/msword' || file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                const isPdf = file.type==='application/pdf';
                const isRar = (file.type==='application/octet-stream' || file.type==='');
                const isZip = (file.type==='application/x-zip-compressed' || file.type==='application/zip');
                if(!isJPG && !isPNG && !isBMP && !isWord && !isPdf && !isRar && !isZip){
                    this.$message.error('上传文件支持的类型：jpg、png、bmp、doc、docx、pdf、rar、zip!');
                    return false;
                }
                if (!isLt5M) {
                    this.$message.error('上传文件大小不能超过 5MB!');
                    return false
                }
                return  true;
            },
            closeDialog(form){
                this.$refs[form].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/emergencyPlanBak/emergencyPlanBaksByPage",{
                    params:{
                        page:this.query.pageIndex,
                        limit:this.query.pageSize
                    }
                }).then(res => {
                    this.tableData = res.data.data;
                    this.pageTotal = res.data.count;
                }).catch(error => {
                    console.log(error);
                });
            },
            cancelAdd(){
                this.addVisible=false;
                this.$refs["form"].clearValidate();
            },
            // 删除操作
            handleDelete(index, row) {
                this.form=row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$axios.get("/emergencyPlanBak/preplanDrillRecord/" + this.form.id).then(res => {
                        if(res.data.data){
                            this.$confirm('存在演练记录，删除该预案，将同时删除演练记录，是否确认?','提示',{
                                type:'warning'
                            }).then(()=>{
                                this.$axios.delete("/emergencyPlanBak/emergencyPlanBak/" + this.form.id).then(res => {
                                    if(res.data.result.resultCode==200){
                                        this.$message.success('删除成功');
                                        this.getData();
                                    }else{
                                        this.$message.error(res.data.result.message);
                                    }
                                }) .catch(error =>{
                                    console.log(error);
                                });
                            })
                        }else{
                            this.$axios.delete("/emergencyPlanBak/emergencyPlanBak/" + this.form.id).then(res => {
                                if(res.data.result.resultCode==200){
                                    this.$message.success('删除成功');
                                    this.getData();
                                }else{
                                    this.$message.error(res.data.result.message);
                                }
                            }) .catch(error =>{
                                console.log(error);
                            });
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
                this.editableForm=JSON.parse(JSON.stringify(this.form));
                this.editVisible = true;
                if(row.writeDate){
                    this.form.writeDate = getDate(new Date(row.writeDate));
                    this.editableForm.writeDate = getDate(new Date(row.writeDate));
                }
                if(row.keepOnRecord){
                    if(row.keepOnRecordDate){
                        this.editableForm.keepOnRecordDate = getDate(new Date(row.keepOnRecordDate));
                        this.form.keepOnRecordDate = getDate(new Date(row.keepOnRecordDate));
                    }
                }
            },
            // 备案操作
            handlePreplan(index, row) {
                this.idx = index;
                this.preplanFormOnly = row;
                this.preplanForm = JSON.parse(JSON.stringify(this.preplanFormOnly));
                this.preplanVisible = true;
                if(row.keepOnRecordDate){
                    this.preplanFormOnly.keepOnRecordDate = getDate(new Date(row.keepOnRecordDate));
                    this.preplanForm.keepOnRecordDate = getDate(new Date(row.keepOnRecordDate));
                }
            },
            // 保存编辑
            saveEdit() {
                this.form = this.editableForm;
                this.$refs.editForm.validate(validate => {
                    if (validate) {
                        this.form.emergencyPlanBakId=this.emergencyPlanBakId;
                        this.$axios.put("/emergencyPlanBak/emergencyPlanBak?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            }
                            this.$refs.editForm.clearValidate();
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
                        return false;
                    }
                });
            },
            // 保存备案
            savePreplan() {
               this.preplanFormOnly = JSON.parse(JSON.stringify(this.preplanForm));
                this.$refs.preplanForm.validate(validate => {
                    if (validate) {
                        this.preplanForm.emergencyPlanBakId=this.emergencyPlanBakId;
                        this.$axios.post("/emergencyPlanBak/updatePreplan", this.$qs.stringify(this.preplanFormOnly)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.preplanVisible = false;
                                this.getData();
                            }
                            this.$refs.preplanForm.clearValidate();
                        }).catch(err => {
                            console.log(err);
                        });
                    } else {
                        return false;
                    }
                });
            },
            // 保存新增
            saveAdd(){
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate =>{
                    if(validate){
                        this.form.emergencyPlanBakId = this.emergencyPlanBakId;
                        this.$axios.post("/emergencyPlanBak/emergencyPlanBak",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
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
            }
        }
    };
</script>

<style scoped>
    @import "../../assets/css/common.css";
    .handle-box {
        margin-bottom: 20px;
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
