<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 安全规章制度-<span style="color:red;">{{(org.province==null?'':org.province.name)+(org.city==null?'':org.city.name)+(org.region==null?'':org.region.name)}}
                    {{org.orgCategory==null?'':org.orgCategory.name}}类</span>
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
                <el-button v-if="Object.keys(org).length>0"
                        type="warning"
                        icon="el-icon-search"
                        class="handle-del mr10"
                        @click="findTemplates"
                >查找模板</el-button>
            </div>
            <el-table
                    :data="tableData"
                    border
                    class="table"
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
                <el-table-column prop="name" label="名称">
                    <template scope="scope">
                        <span style="cursor: pointer;color:#409EFF;" @click="showContent(scope.row)">{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="publishDate" label="发布日期" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="publishDepartment" label="发文部门"></el-table-column>
                <el-table-column prop="num" label="发文字号"></el-table-column>
                <el-table-column prop="timeliness" label="时效性"></el-table-column>
                <el-table-column prop="note" label="备注">
                    <template scope="scope">
                        <span style="cursor: pointer;color:#409EFF;" @click="showNote(scope.row.note)">{{ scope.row.note }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="280" align="center">
                    <template slot-scope="scope">
                        <el-upload style="display: none;"
                                   :action="uploadUrl"
                                   :limit="1"
                                   :auto-upload="true"
                                   ref="uploadFile"
                                   :data="param"
                                   accept=".doc,.docx"
                                   :on-success="handleAvatarSuccess"
                                   :before-upload="beforeAvatarUpload"
                                   :headers="headers">
                            <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">导入</el-button>
                        </el-upload>
                        <el-button
                                type="text"
                                icon="el-icon-upload2"
                                class="upload"
                                @click="uploadTemplate(scope.$index, scope.row)"
                        >上传文件</el-button>
                        <el-button v-if="scope.row.realPath"
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="downloadTemplate(scope.$index, scope.row)"
                        >下载文件</el-button>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @close="closeDialog" @open="loadData">
            <el-form ref="form" :rules="rules" :model="form" label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="发布日期" prop="publishDate">
                    <el-date-picker
                            v-model="form.publishDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="发文部门">
                    <el-input v-model="form.publishDepartment" ></el-input>
                </el-form-item>
                <el-form-item label="区域" v-if="!haveOrg" prop="area">
                    <el-cascader
                            v-model="form.area"
                            :options="areas"
                            :props="{label:'name',value:'id'}"
                            @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="企业类别" v-if="!haveOrg" prop="orgCategoryId">
                    <el-select v-model="form.orgCategoryId" placeholder="请选择" style="width: 100%;" >
                        <el-option
                                v-for="item in orgCategories"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note" type="textarea" :rows="3"></el-input>
                </el-form-item>
                <el-form-item label="时效性" prop="timeliness">
                    <el-select v-model="form.timeliness">
                        <el-option label="有效"  value="有效"></el-option>
                        <el-option label="无效"  value="无效"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 查询系统模板 -->
        <el-dialog title="系统模板" :visible.sync="templatesVisible" width="70%"  @close="closeDialog" @open="loadData">
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
                        <el-button
                                type="text"
                                icon="el-icon-view"
                                @click="checkContent(scope.$index, scope.row)"
                        >查看内容</el-button>
                        <el-button
                                type="text"
                                icon="el-icon-copy-document"
                                class="red"
                                @click="importTemplate(scope.$index, scope.row)"
                        >引入</el-button>
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
        <el-dialog title="新增" :visible.sync="addVisible" width="30%"  @close="closeDialog" @open="loadData">
            <el-form ref="form" :model="form" :rules="rules"  label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="发布日期" prop="publishDate">
                    <el-date-picker
                            v-model="form.publishDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="发文部门">
                    <el-input v-model="form.publishDepartment" ></el-input>
                </el-form-item>
                <el-form-item label="区域" v-if="!haveOrg" prop="area">
                    <el-cascader
                            v-model="form.area"
                            :options="areas"
                            :props="{label:'name',value:'id'}"
                            @change="handleChange"></el-cascader>
                </el-form-item>
                <el-form-item label="企业类别" v-if="!haveOrg" prop="orgCategoryId">
                    <el-select v-model="form.orgCategoryId" placeholder="请选择" style="width: 100%;" >
                        <el-option
                                v-for="item in orgCategories"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note" type="textarea" :rows="3"></el-input>
                </el-form-item>
                <el-form-item label="时效性" prop="timeliness">
                    <el-select v-model="form.timeliness">
                        <el-option label="有效"  value="有效"></el-option>
                        <el-option label="无效"  value="无效"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="备注" :visible.sync="noteVisible" width="30%">
            {{note}}
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="noteVisible=false">确 定</el-button>
            </span>
        </el-dialog>
        <!--显示文本内容-->
        <el-dialog title="文本内容" :visible.sync="showContentVisible" width="60%">
            <div id="printContent">
                <div v-html="form.content"></div>
            </div>
            <div style="margin-top: 10px;">
                <el-card shadow="hover" v-if="notices.length>0">
                    <div slot="header" class="clearfix">
                        <span style="font-weight: bold;">发文历史</span>
                    </div>
                    <el-row v-for="(notice,index) in notices" style="color: red;margin: 5px;">
                        <el-col :span="1"><div>{{index+1}}</div></el-col>
                        <el-col :span="23"><div>{{notice.publishDate | formatDate}}</div></el-col>
                    </el-row>
                </el-card>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="showContentVisible=false,editContentVisible=true">编辑</el-button>
                 <el-button type="warning" v-print="printObj">打印</el-button>
                 <el-button type="success" @click="handleExecute" v-if="form.content && Object.keys(org).length>0">发文执行</el-button>
                <el-button  @click="showContentVisible=false">关闭</el-button>
            </span>
        </el-dialog>
        <el-dialog title="模板内容" :visible.sync="showTemplateContentVisible" width="60%">
            <div v-html="template.content"></div>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="showTemplateContentVisible=false">关闭</el-button>
            </span>
        </el-dialog>
        <!--编辑文本内容-->
        <el-dialog title="编辑内容" :visible.sync="editContentVisible" width="60%">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
                <vue-editor id="editor" v-model="form.content" :editor-toolbar="customToolbar" useCustomImageHandler></vue-editor>
            </el-form>
            <span slot="footer" class="dialog-footer">
                        <el-button  @click="editContentVisible=false">取消</el-button>
                        <el-button type="primary" @click="saveContent">确 定</el-button>
                    </span>
        </el-dialog>
    </div>
</template>

<script>
    import  {getDate} from "../common/utils";
    import { VueEditor } from "vue2-editor";
    export default {
        components:{
            VueEditor
        },
        name: 'basetable',
        data() {
            return {
                printObj:{
                    id:'printContent'
                },
                customToolbar: [
                    ["bold", "italic", "underline"]
                ],
                query: {
                    pageIndex: 1,
                    pageSize: 10
                },
                templates: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageTotal:0
                },
                param:{type:'rule'},
                uploadUrl:'',
                headers:{
                    token : localStorage.getItem("token")
                },
                noteVisible:false,
                note:'',
                orgCategories:[],
                notices:[],
                tableData: [],
                templatesData:[],
                templatesVisible:false,
                delList: [],
                editVisible: false,
                addVisible: false,
                showContentVisible:false,
                editContentVisible:false,
                pageTotal: 0,
                haveOrg:false,
                form: {
                },
                template:{},
                idx: -1,
                org:{},
                id: -1,
                showTemplateContentVisible:false,
                areas:[],
                rules:{
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ],
                    publishDate:[
                        { required: true, message: '请选择发布日期', trigger: 'blur' }
                    ],
                    area: [{ type:'array', required: true, message: '请选择区域', trigger:['blur','change'] }],
                    orgCategoryId: [{ required: true, message: '请选择企业类别', trigger: ['blur','change'] }],
                    timeliness:[
                        { required: true, message: '请选择时效性', trigger: 'blur' }
                    ],
                    content:[
                        { required: true, message: '请输入文本内容', trigger: 'blur' }
                    ]
                }
            };
        },
        filters:{
            formatDate(value){
                if(value){
                    return getDate(new Date(value));
                }else{
                    return '';
                }
            }
        },
        created() {
            this.getData();
            this.uploadUrl = this.$baseURL + "/templateUpload";
            this.$axios.get("/user/haveOrg").then(res =>{
                if(res.data.data){
                    this.haveOrg = true;
                    this.org = res.data.data;
                }
            }).catch(error=>console.log(error));
        },
        methods: {
            handleAvatarSuccess(res, file) {
                this.$message.success("上传成功!");
                this.getData();
            },
            beforeAvatarUpload(file) {
                const isLt5M = file.size / 1024 / 1024 < 5;
                const isWord = (file.type==='application/msword' | file.type==='application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                if (!isLt5M) {
                    this.$message.error('上传文件大小不能超过 5MB!');
                    return false
                }
                if(!isWord){
                    this.$message.error('只能上传work文档!');
                    return false;
                }
                return  isWord&isLt5M;
            },
            uploadTemplate(index,row){
                this.$refs.uploadFile.clearFiles();
                this.param.id=row.id;
                this.$refs.fileUploadBtn.$el.click();
            },
            downloadTemplate(index,row){
                window.location.href=this.$baseURL + "/" + row.url;
            },
            checkContent(index,row){//查看模板内容
               this.showTemplateContentVisible = true;
               this.template = row;
            },
            importTemplate(index,row){//引入模板
               this.template = row;
                this.$confirm('确定要引入该模板吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        let formData = new FormData();
                        formData.append("templateId",row.id);
                        this.$axios.post("/rules/template",formData)
                            .then(res=>{
                                this.getData();
                                this.templatesVisible=false;
                                this.showContentVisible = true;
                                this.editable=true;
                            }).catch(error=>console.log(error));
                    })
                    .catch(() => {});
            },
            findTemplates(){
                this.$axios.get("/template/templatesByPage",{
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
            handleExecute(){
                if(!this.form.content){
                    this.$message.error("该文件内容为空，不能发布!");
                    return false;
                }
                this.$confirm('确定要发布该通知吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.get("/rules/publishRules" ,{
                            params:{
                                id:this.form.id
                            }
                        } ).then(res => {
                            if(res.data.result.resultCode==200){
                                this.$message.success('发布成功，请到企业发文通知中查看!');
                                this.showContentVisible=false;
                                //this.getData();
                            }else{
                                this.$message.error(res.data.result.message);
                            }
                        }) .catch(error =>{
                            console.log(error);
                        });
                    })
                    .catch(() => {});
            },
            saveContent(){
                this.$axios.post("/rules/content" , this.$qs.stringify(this.form)).then(res => {
                    if (res.data.result.resultCode == 200) {
                        this.editContentVisible = false;
                        this.getData();
                    } else {
                        this.$message.error(res.data.result.message);
                    }
                }).catch(err => {
                    console.log(err);
                });
            },
            showContent(row){
                this.form = row;
                this.showContentVisible=true;
                this.$axios.get("/notice/notices",{
                    params:{
                        lawOrRulesId:row.id,
                        type:'rules'
                    }
                }).then(res =>{
                    this.notices = res.data;
                }).catch(error=>console.log(error));
            },
            showNote(note){
                this.note = note;
                this.noteVisible=true;
            },
            loadData(){
                if(!this.haveOrg){
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
                }
            },
            handleAdd(){
                this.form = {};
                this.addVisible = true;
            },
            handleChange(){
                if(this.form.area&&this.form.area.length>0){
                    this.form.provinceId=this.form.area[0];
                    this.form.cityId=this.form.area[1];
                    this.form.regionId=this.form.area[2];
                }
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/rules/rulesByPage",{
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
                })
                    .then(() => {
                        this.$axios.delete("/rules/rules/" + row.id).then(res => {
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
                    .catch(() => {});
            },
            // 编辑操作
            handleEdit(index, row) {
                this.idx = index;
                this.form = row;
                this.editVisible = true;
                if(row.publishDate){
                    this.form.publishDate = getDate(new Date(row.publishDate));
                }
                if(row.orgCategory){
                    this.form.orgCategoryId = row.orgCategory.id;
                }
                this.form.area=[row.province.id,row.city.id,row.region.id];
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.form.content='';
                        this.$axios.put("/rules/rules?" + this.$qs.stringify(this.form)).then(res => {
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
            // 保存新增
            saveAdd(){
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate =>{
                    if(validate){
                        this.$axios.post("/rules/rules",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
                                this.form = {};
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
            handleTemplatesPageChange(val) {
                this.$set(this.templates, 'pageIndex', val);
                this.findTemplates();
            }
        }
    };
</script>
<style scoped>
    @import "../../assets/css/common.css";
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
