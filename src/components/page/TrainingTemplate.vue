<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 培训模板
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
                <el-table-column prop="creator" label="创建人"></el-table-column>
                <el-table-column prop="orgCategory.name" label="企业类别"></el-table-column>
                <el-table-column prop="province.name" label="省"></el-table-column>
                <el-table-column prop="city.name" label="市"></el-table-column>
                <el-table-column prop="region.name" label="区"></el-table-column>
                <el-table-column prop="createDate" label="创建日期" :formatter="dateFormatter"></el-table-column>
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
                        >上传模板</el-button>
                        <el-button v-if="scope.row.realPath"
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="downloadTemplate(scope.$index, scope.row)"
                        >下载模板</el-button>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%"  @open="loadSelectData" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-row type="flex" class="row-bg" v-if="!haveOrg">
                    <el-col >
                        <el-form-item label="省市区">
                            <el-cascader
                                    v-model="form.area"
                                    :options="areas"
                                    :props="{label:'name',value:'id',checkStrictly: true}"
                                    @change="handleChange"></el-cascader>
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
                    <el-input v-model="form.note"  maxlength="500"   type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%"   @open="loadSelectData" @close="closeDialog" >
            <el-form ref="form" :rules="rules" :model="form" label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-row type="flex" class="row-bg" v-if="!haveOrg">
                    <el-col >
                        <el-form-item label="省市区">
                            <el-cascader
                                    v-model="form.area"
                                    :options="areas"
                                    :props="{label:'name',value:'id',checkStrictly: true}"
                                    @change="handleChange"></el-cascader>
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
                    <el-input v-model="form.note"   maxlength="500"  type="textarea" :rows="3"></el-input>
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
        <!--显示模板内容-->
        <el-dialog title="模板内容" :visible.sync="showContentVisible" width="50%">
            <table style="width: 100%;" cellspacing="0" cellpadding="0">
                <caption style="font-size: 18px;letter-spacing: 10px;">{{trainingTemplate.name}}</caption>
                <tr>
                    <td colspan="6" style="border: none;">
                        <div style="float: right;margin-right: 10px;">
                            <div style="display: inline-block;border-bottom: black solid 1px;width:50px;"></div>
                            <label>年</label>
                            <div style="display: inline-block;border-bottom: black solid 1px;width:50px;"></div>
                            <label>月</label>
                            <div style="display: inline-block;border-bottom: black solid 1px;width:50px;"></div>
                            <label>日</label>
                            <label style="margin-left:20px;">星期</label>
                            <div style="display: inline-block;border-bottom: black solid 1px;width:50px;"></div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>活动名称</td>
                    <td colspan="3">
                        <input v-if="editable"  maxlength="50"   v-model="trainingTemplate.trainingName"  />
                        <div v-else>{{trainingTemplate.trainingName}}</div>
                    </td>
                </tr>
                <tr>
                    <td>参加对象</td>
                    <td colspan="3">
                        <input v-if="editable"  maxlength="200"   v-model="trainingTemplate.attendants" />
                        <div v-else>{{trainingTemplate.attendants}}</div>
                    </td>
                </tr>
                <tr>
                    <td style="text-space: 30px;">地点</td>
                    <td>
                        <input v-if="editable"  maxlength="200"   v-model="trainingTemplate.trainingPlace" />
                        <div v-else>{{trainingTemplate.trainingPlace}}</div>
                    </td>
                    <td style="text-space: 30px;">主讲人</td>
                    <td>
                        <input v-if="editable"  maxlength="50"   v-model="trainingTemplate.president" />
                        <div v-else>{{trainingTemplate.president}}</div>
                    </td>
                </tr>
                <tr>
                    <td>参加人数</td>
                    <td>
                        <div>
                        <span>应到:</span>
                        <input v-if="editable"  maxlength="10"   v-model="trainingTemplate.attendance" />
                        <span v-else>{{trainingTemplate.attendance}}</span>
    </div><div>
                        <span>实到:</span>
                        <input v-if="editable"   maxlength="10"   v-model="trainingTemplate.realAttendance" />
                        <span v-else>{{trainingTemplate.realAttendance}}</span>
                    </div>
                    </td>
                    <td style="text-space: 30px;">记录人</td>
                    <td>
                        <input v-if="editable"   maxlength="50"   v-model="trainingTemplate.recorder" />
                        <div v-else>{{trainingTemplate.recorder}}</div>
                    </td>
                </tr>
                <tr style="border-bottom: none;">
                    <td colspan="4" style="text-align: left; border-bottom: none;" >
                        安全学习及教育培训活动内容和反馈意见（可粘附活动照片）：
                    </td>
                </tr>
                <tr>
                    <td colspan="4">
                        <textarea v-if="editable"   maxlength="500"   v-model="trainingTemplate.content" rows="8" ></textarea>
                        <div v-else v-html="trainingTemplate.content"></div>
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button v-if="!editable" type="primary" @click="editContent">编辑</el-button>
                <el-button v-else type="primary" @click="saveContent">保存</el-button>
                <el-button  @click="showContentVisible=false">关闭</el-button>
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
                customToolbar: [
                    ["bold", "italic", "underline"]
                ],
                query: {
                    pageIndex: 1,
                    pageSize: 10
                },
                noteVisible:false,
                note:'',
                orgCategories:[],
                areas:[],
                editable:false,
                uploadUrl:'',
                param:{type:'trainingTemplate'},
                headers:{
                    token : localStorage.getItem("token")
                },
                notices:[],
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                showContentVisible:false,
                pageTotal: 0,
                haveOrg:false,
                trainingTemplate:{},
                form: {
                    area:[]
                },
                idx: -1,
                org:{},
                id: -1,
                rules:{
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
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
            uploadTemplate(index,row){
                this.$refs.uploadFile.clearFiles();
                this.param.id=row.id;
                this.$refs.fileUploadBtn.$el.click();
            },
            downloadTemplate(index,row){
                //window.location.href=this.$baseURL + "/" + row.url;
                window.open(this.$baseURL + "/" + row.url);
            },
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
                    this.$message.error('只能上传word文档!');
                    return false;
                }
                return  true;
            },
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
            editContent(){
                this.editable=true;
                if(this.trainingTemplate.content){
                    this.trainingTemplate.content = this.trainingTemplate.content.replace(/<br>/g,"\n");
                }
                if(this.trainingTemplate.problems){
                    this.trainingTemplate.problems = this.trainingTemplate.problems.replace(/<br>/g,"\n");
                }
                if(this.trainingTemplate.templateNote){
                    this.trainingTemplate.templateNote = this.trainingTemplate.templateNote.replace(/<br>/g,"\n");
                }
                if(this.trainingTemplate.methods){
                    this.trainingTemplate.methods = this.trainingTemplate.methods.replace(/<br>/g,"\n");
                }
            },
            saveContent(){
                if(this.trainingTemplate.content){
                    this.trainingTemplate.content = this.trainingTemplate.content.replace(/\n/g,"<br>");
                }
                if(this.trainingTemplate.problems){
                    this.trainingTemplate.problems = this.trainingTemplate.problems.replace(/\n/g,"<br>");
                }
                if(this.trainingTemplate.templateNote){
                    this.trainingTemplate.templateNote = this.trainingTemplate.templateNote.replace(/\n/g,"<br>");
                }
                if(this.trainingTemplate.methods){
                    this.trainingTemplate.methods = this.trainingTemplate.methods.replace(/\n/g,"<br>");
                }
                this.$axios.post("/trainingTemplate/content", this.$qs.stringify(this.trainingTemplate)).then(res => {
                    if (res.data.result.resultCode == 200) {
                        this.showContentVisible = false;
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
                this.trainingTemplate=row;
                this.showContentVisible=true;
                this.editable = false;
            },
            showNote(note){
                this.note = note;
                this.noteVisible=true;
            },
            handleAdd(){
                this.form = {};
                this.addVisible = true;
            },
            handleChange(){
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
                this.$axios.get("/trainingTemplate/trainingTemplatesByPage",{
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
                        this.$axios.delete("/trainingTemplate/trainingTemplate/" + row.id).then(res => {
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
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.form.content='';
                        this.$axios.put("/trainingTemplate/trainingTemplate?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.form.type='training';
                        this.$axios.post("/trainingTemplate/trainingTemplate",this.$qs.stringify(this.form)).then(res=>{
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

    .per20{
        width:20%;
    }
    .per30{
        width:30%;
    }

    table tr td{
        border: black solid 1px;
        text-align: center;
        height:30px;
        line-height: 30px;
    }
    td input,td textarea{
        border: none;
        font-size: 16px;
        width: 90%;
        padding: 3px;
    }

    td div{
        text-align: left;
        padding-left: 5px;
    }
</style>
