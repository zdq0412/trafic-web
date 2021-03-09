<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 日常安全检查
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
                        <!--<span style="cursor: pointer;color:#409EFF;" @click="showContent(scope.row)">{{ scope.row.name }}</span>-->
                        <span v-if="scope.row.url!=null && scope.row.url!=''" style="cursor: pointer;color:#409EFF;" @click="downloadTemplate(scope.$index, scope.row)">{{ scope.row.name }}</span>
                        <span v-else>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="creator" label="创建人"></el-table-column>
                <el-table-column prop="checkDate" label="检查时间" :formatter="datetimeFormatter"></el-table-column>
                <!--<el-table-column label="现场照片">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-search"
                                @click="lookup(scope.$index, scope.row)"
                        >查看</el-button>
                    </template>
                </el-table-column>-->
                <el-table-column prop="note" label="备注">
                    <template scope="scope">
                        <span style="cursor: pointer;color:#409EFF;" @click="showNote(scope.row.note)">{{ scope.row.note }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="280" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                icon="el-icon-upload2"
                                class="upload"
                                @click="uploadTemplate(scope.$index, scope.row)"
                        >上传文件</el-button>
                        <!--<el-button v-if="scope.row.realPath"
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="downloadTemplate(scope.$index, scope.row)"
                        >下载文件</el-button>-->
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
                   ref="uploadFile"
                   :data="param"
                   :accept="ext"
                   :on-success="handleAvatarSuccess"
                   :before-upload="beforeAvatarUpload"
                   :headers="headers">
            <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">导入</el-button>
        </el-upload>
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%"   @close="closeDialog">
            <el-form ref="editForm" :rules="rules" :model="editableForm" label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="editableForm.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="检查时间" prop="checkDate">
                    <el-date-picker
                            v-model="editableForm.checkDate"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="选择检查时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="editableForm.note" maxlength="500" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false;editableForm=JSON.parse(JSON.stringify(form))">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%"   @close="closeDialog" @open="clearValidate">
            <el-form ref="form" :rules="rules" :model="form" label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="检查时间" prop="checkDate">
                    <el-date-picker
                            v-model="form.checkDate"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="选择检查时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note" maxlength="500" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
        <el-dialog title="备注" :visible.sync="noteVisible" width="40%">
            {{note}}
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="noteVisible=false">确 定</el-button>
            </span>
        </el-dialog>
        <!--显示内容-->
        <!--<el-dialog title="" :visible.sync="showContentVisible" width="50%">
            <div id="printContent">
                <div class="titleDiv">
                    <div class="titleName">安全管理监督检查记录</div>
                    <div class="orgNameDiv">
                        <label>企业名称:</label>
                        <div class="orgName">
                            {{org.name}}
                        </div>
                    </div>
                    <div class="addrDiv">
                        <label>地&nbsp;&nbsp;&nbsp;&nbsp;址:</label>
                        <div class="addr">
                            {{org.addr}}
                        </div>
                    </div>
                </div>
                <div style="padding-top:0;">
                    <div  style="font-size: 18px;letter-spacing: 10px;text-align: center;width:95%;height:40%;">{{securityCheck.name}}</div>
                    <table class="securityCheckTable" cellspacing="0" cellpadding="0">
                        <tr>
                            <td colspan="2" style="border: none;">
                                <div style="float: right;margin-right: 10px;padding-bottom: 3px;">
                                    <label style="display: inline-block;border-bottom: black solid 1px;height:22px;width:50px;padding-bottom: 0px;">
                                        {{securityCheck.checkDate | formatYear}}
                                    </label>
                                    <label>年</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                        {{securityCheck.checkDate | formatMonth}}
                                    </div>
                                    <label>月</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                        {{securityCheck.checkDate | formatDay}}
                                    </div>
                                    <label>日</label>
                                    <label style="margin-left:20px;">星期</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:50px;height:22px;">
                                        {{securityCheck.checkDate | formatWeek}}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="per20">受检单位(部门、车辆)</td>
                            <td class="per80">
                                <textarea v-if="editable" maxlength="500" v-model="securityCheck.checkObject" style="height: 56px;"></textarea>
                                <div v-else  style="height: 56px;">{{securityCheck.checkObject}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td class="per20">参加监督检查的单位(部门)及人员</td>
                            <td class="per80">
                                <textarea v-if="editable" maxlength="500" v-model="securityCheck.deptAndEmp"  style="height: 30mm;"></textarea>
                                <div v-else  v-html="securityCheck.deptAndEmp"  style="height: 30mm;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td class="per20">监督检查的主要内容</td>
                            <td class="per80">
                                <textarea v-if="editable" maxlength="2000" v-model="securityCheck.content"  style="height: 40mm;"></textarea>
                                <div v-else v-html="securityCheck.content"  style="height: 40mm;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td class="per20">监督检查中查出的问题</td>
                            <td class="per80">
                                <textarea v-if="editable" maxlength="2000" v-model="securityCheck.problems"  style="height: 50mm;"></textarea>
                                <div v-else v-html="securityCheck.problems"  style="height:50mm;"></div>
                            </td>
                        </tr>
                        <tr>
                            <td class="per20">检查组处理意见</td>
                            <td class="per80">
                                <table style="width: 100%;">
                                    <tr>
                                        <td style="border: none;">
                                            <textarea v-if="editable" maxlength="500" v-model="securityCheck.suggestion"  style="height: 30mm;"></textarea>
                                            <div v-else v-html="securityCheck.suggestion"  style="height: 30mm;"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="border: none;text-align: left;">检查人员签名:</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td class="per20">整改结果</td>
                            <td class="per80">
                                <table style="width:100%;">
                                    <tr>
                                        <td  style="border: none;">
                                            <textarea v-if="editable" maxlength="500" v-model="securityCheck.result"  style="height: 20mm;"></textarea>
                                            <div v-else v-html="securityCheck.result"  style="height: 20mm;"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: right;border: none;">确认人签名:<div style="display: inline-block;width:100px;"></div>
                                            月&nbsp;&nbsp;&nbsp;&nbsp;日</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2" style="border: none;text-align: left;">
                                受检单位(部门、车辆)代表人签名:
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
            <div style="width:100%;text-align: center;">
                <el-button v-if="!editable" type="primary" @click="editContent">编辑</el-button>
                <el-button v-if="!editable" type="warning" v-print="printObj">打印</el-button>
                <el-button v-if="editable" type="primary" @click="saveContent">保存</el-button>
                <el-button  @click="showContentVisible=false">关闭</el-button>
            </div>
        </el-dialog>-->
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
                        <!--<el-button
                                type="text"
                                icon="el-icon-view"
                                @click="checkContent(scope.$index, scope.row)"
                        >查看内容</el-button>
                        <el-button
                                type="text"
                                icon="el-icon-copy-document"
                                class="red"
                                @click="importTemplate(scope.$index, scope.row)"
                        >引入</el-button>-->
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
        <!--模板内容-->
        <!--<el-dialog title="模板内容" :visible.sync="showTemplateContentVisible" width="60%">
            <table style="width: 100%;" cellspacing="0" cellpadding="0">
                <caption>{{securityCheck.name}}</caption>
                <tr>
                    <td colspan="2" style="border: none;">
                        <div style="float: right;margin-right: 10px;">检查日期</div>
                    </td>
                </tr>
                <tr>
                    <td class="per20">检查对象</td>
                    <td class="per80">
                        <textarea v-if="editable" maxlength="500" v-model="securityCheck.checkObject"  placeholder="检查对象"></textarea>
                        <div v-else>{{securityCheck.checkObject}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per20">监督检查的部门及人员</td>
                    <td class="per80">
                        <textarea v-if="editable" maxlength="500" v-model="securityCheck.deptAndEmp" placeholder="监督检查的部门及人员" ></textarea>
                        <div v-else>{{securityCheck.deptAndEmp}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per20">检查主要内容</td>
                    <td class="per80">
                        <textarea v-if="editable" maxlength="500" v-model="securityCheck.content"  placeholder="检查主要内容"></textarea>
                        <div v-else v-html="securityCheck.content"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per20">提出问题</td>
                    <td class="per80">
                        <textarea v-if="editable" maxlength="500" v-model="securityCheck.problems" placeholder="提出问题" rows="5"></textarea>
                        <div v-else v-html="securityCheck.problems"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per20">整改结果</td>
                    <td class="per80">
                        <textarea v-if="editable" maxlength="500" v-model="securityCheck.result" placeholder="整改结果" rows="5"></textarea>
                        <div v-else v-html="securityCheck.result"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per20">监察人员签字</td>
                    <td class="per80" style="height:50px;">

                    </td>
                </tr>
                <tr>
                    <td class="per20">受检对象签字</td>
                    <td class="per80"  style="height:50px;">
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="showTemplateContentVisible=false">关闭</el-button>
            </span>
        </el-dialog>-->
    </div>
</template>

<script>
    import  {getDate,getDateTime} from "../common/utils";
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

                headers:{
                    token : localStorage.getItem("token")
                },
                param:{type:'securityCheck'},
                templatesData:[],
                templateVisible:false,
                templates: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageTotal:0
                },
                showTemplateContentVisible:false,
                template:{},
                templatesVisible:false,

                ext:'.doc,.docx,.jpg,.jpeg,.bmp,.rar,.zip,.png,.pdf',
                noteVisible:false,
                note:'',
                orgCategories:[],
                areas:[],
                editable:false,
                notices:[],
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                showContentVisible:false,
                pageTotal: 0,
                haveOrg:false,
                securityCheck:{},
                form: {
                    area:[]
                },
                editableForm:{},
                idx: -1,
                org:{},
                id: -1,
                rules:{
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ],
                    content:[
                        { required: true, message: '请输入文本内容', trigger: 'blur' }
                    ],
                    checkDate:[
                        {required:true,message:'请选择检查日期'}
                    ]
                }
            };
        },
        filters:{
            formatYear(value){
                if(value) {
                    return new Date(value).getFullYear();
                }else{
                    return '';
                }
            },
            formatMonth(value){
                if(value) {
                    return new Date(value).getMonth()+1;
                }else{
                    return '';
                }
            },
            formatDay(value){
                if(value) {
                    return new Date(value).getDate();
                }else{
                    return '';
                }
            },
            formatWeek(value){
                let weeks = ['日','一','二','三','四','五','六'];
                if(value) {
                    return weeks[new Date(value).getDay()];
                }else{
                    return '';
                }
            },
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
            lookup(index, row) {
                localStorage.setItem("pid",row.id);
                localStorage.setItem("type",'CHECKING');
                this.$router.push({name:"photo",params:{pid:row.id,type:'CHECKING'}});
            },
            importTemplate(index,row){//引入模板
                this.template = row;
                this.$confirm('确定要引入该模板吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        let formData = new FormData();
                        formData.append("templateId",row.id);
                        this.$axios.post("/securityCheck/template",formData)
                            .then(res=>{
                                this.getData();
                                this.templatesVisible=false;
                                this.showContentVisible = true;
                                this.editable=true;
                                this.securityCheck = res.data.data;
                            }).catch(error=>console.log(error));
                    })
                    .catch(() => {});
            },
            checkContent(index,row){//查看模板内容
                this.showTemplateContentVisible = true;
                this.template = row;
            },
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
            //查找模板
            findTemplates(){
                this.$axios.get("/securityCheckTemplate/securityCheckTemplatesByPage",{
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
                if(this.securityCheck.content){
                    this.securityCheck.content = this.securityCheck.content.replace(/<br>/g,"\n");
                }
                if(this.securityCheck.problems){
                    this.securityCheck.problems = this.securityCheck.problems.replace(/<br>/g,"\n");
                }
                if(this.securityCheck.result){
                    this.securityCheck.result = this.securityCheck.result.replace(/<br>/g,"\n");
                }
            },
            saveContent(){
                if(this.securityCheck.content){
                    this.securityCheck.content = this.securityCheck.content.replace(/\n/g,"<br>");
                }
                if(this.securityCheck.problems){
                    this.securityCheck.problems = this.securityCheck.problems.replace(/\n/g,"<br>");
                }
                if(this.securityCheck.result){
                    this.securityCheck.result = this.securityCheck.result.replace(/\n/g,"<br>");
                }
                this.$axios.post("/securityCheck/content", this.$qs.stringify(this.securityCheck)).then(res => {
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
               // this.form = row;
                this.securityCheck=row;
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
                    if(this.form.area.length==2){
                        this.form.cityId=this.form.area[1];
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
            datetimeFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDateTime(new Date(cellValue));
                }else{
                    return '';
                }
            },
            closeDialog(){
                this.form={};
                if(this.$refs["form"]){
                    this.$refs["form"].clearValidate();
                }
                if(this.$refs["editableForm"]){
                    this.$refs["editableForm"].clearValidate();
                }
            },
            clearValidate(){
              this.closeDialog();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/securityCheck/securityChecksByPage",{
                    params:{
                        page:this.query.pageIndex,
                        limit:this.query.pageSize,
                        type:'training'
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
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/securityCheck/securityCheck/" + row.id).then(res => {
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
                this.editableForm = JSON.parse(JSON.stringify(this.form));
                this.editVisible = true;
                if(row.checkDate){
                    this.form.checkDate=getDate(new Date(row.checkDate));
                    this.editableForm.checkDate=getDateTime(new Date(row.checkDate));
                }
                /*if(row.orgCategory){
                    this.form.orgCategoryId = row.orgCategory.id;
                }
                if(row.province && row.city && row.region){
                    this.form.area=[row.province.id,row.city.id,row.region.id];
                }else if(row.province && row.city){
                    this.form.area=[row.province.id,row.city.id];
                }else if(row.province){
                    this.form.area=[row.province.id];
                }*/
            },
            // 保存编辑
            saveEdit() {
                this.form = JSON.parse(JSON.stringify(this.editableForm));
                this.$refs.editForm.validate(validate => {
                    if (validate) {
                        this.form.content='';
                        this.$axios.put("/securityCheck/securityCheck?" + this.$qs.stringify(this.form)).then(res => {
                            if (res.data.result.resultCode == 200) {
                                this.editVisible = false;
                                this.getData();
                            } else {
                                this.$message.error(res.data.result.message);
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
            // 保存新增
            saveAdd(){
                this.$refs["form"].clearValidate();
                this.$refs.form.validate(validate =>{
                    if(validate){
                        this.form.type='training';
                        this.$axios.post("/securityCheck/securityCheck",this.$qs.stringify(this.form)).then(res=>{
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

    @media print {
        .titleDiv{
            height: 232mm;width:100%;padding-top: 65mm;
        }

        .titleName{
            font-size: 30px;color:black;text-align: center;letter-spacing: 2mm;
        }

        .orgNameDiv{
            margin-top:60mm;font-size: 25px;color:black;text-align: center;letter-spacing: 2mm;
        }

        .orgName{
            border-bottom: black solid 1px;width: 60%;display: inline-block;
        }

        .addrDiv{
            margin-top:30mm;font-size: 25px;color:black;text-align: center;letter-spacing: 2mm;
        }

        .addr{
            border-bottom: black solid 1px;width: 60%;display: inline-block;
        }

        .securityCheckTable{
            width: 170mm;margin-left:auto;margin-right:auto;
        }
    }

    @media screen {
        .titleDiv{
            height: 232mm;width:100%;padding-top: 65mm;
        }

        .titleName{
            font-size: 30px;color:black;text-align: center;letter-spacing: 2mm;
        }

        .orgNameDiv{
            margin-top:60mm;font-size: 25px;color:black;text-align: center;letter-spacing: 2mm;
        }

        .orgName{
            border-bottom: black solid 1px;width: 60%;display: inline-block;
        }

        .addrDiv{
            margin-top:30mm;font-size: 25px;color:black;text-align: center;letter-spacing: 2mm;
        }

        .addr{
            border-bottom: black solid 1px;width: 60%;display: inline-block;
        }

        .securityCheckTable{
            width: 98%;margin-left:auto;margin-right:auto;
        }
    }


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
    .per80{
        width:80%;
    }

    table tr td{
        border: black solid 1px;
        text-align: center;
        height:30px;
        line-height: 30px;
    }
    td input,td textarea{
        border: none;
        font-size: 20px;
        width: 98%;
        padding: 3px;
    }

    td div{
        text-align: left;
        padding-left: 5px;
    }

</style>
