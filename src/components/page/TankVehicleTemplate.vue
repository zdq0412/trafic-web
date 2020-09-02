<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 罐式车辆检查模板
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
                                    :props="{label:'name',value:'id'}"
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
                    <el-input v-model="form.note" maxlength="500"  type="textarea" :rows="3"></el-input>
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
                                    :props="{label:'name',value:'id'}"
                                    @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if="!haveOrg">
                    <el-col>
                        <el-form-item label="企业类别" >
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
                    <el-input v-model="form.note" maxlength="500"  type="textarea" :rows="3"></el-input>
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
                <caption>{{tankVehicleTemplate.name}}</caption>
                <tr>
                    <td class="per20" style="text-align: center;">车 号</td>
                    <td colspan="2">
                        <input v-if="editable" maxlength="20"  v-model="tankVehicleTemplate.carNo" placeholder="车号"/>
                        <div v-else>{{tankVehicleTemplate.carNo}}</div>
                    </td>
                    <td class="per20" style="text-align: center;">检查时间</td>
                    <td class="per20">  年 月 日</td>
                </tr>
                <tr>
                    <td colspan="3">罐体有无破损、罐体是否整洁、罐体灯光是否完整</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem1" style="display: inline-block;">
                                <input v-if="!tankVehicleTemplate.checkItem1"  maxlength="100"  v-model="tankVehicleTemplate.checkItem1Msg" :placeholder="placeholderTxt"/>
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem1" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem1"> {{tankVehicleTemplate.checkItem1Msg}}</span>
                            </el-checkbox>

                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">反光条是否完整、反光标示是否完整、反光牌是否有</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem2">
                                <input v-if="!tankVehicleTemplate.checkItem2"  maxlength="100"   v-model="tankVehicleTemplate.checkItem2Msg" :placeholder="placeholderTxt"/>
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem2" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem2"> {{tankVehicleTemplate.checkItem2Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">后保险杠是否合格</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem3">
                                <input v-if="!tankVehicleTemplate.checkItem3"  maxlength="100"   v-model="tankVehicleTemplate.checkItem3Msg" :placeholder="placeholderTxt"/>
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem3" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem3"> {{tankVehicleTemplate.checkItem3Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">静电接地带是否有效</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem4">
                                <input v-if="!tankVehicleTemplate.checkItem4"  maxlength="100"   v-model="tankVehicleTemplate.checkItem4Msg" :placeholder="placeholderTxt" />
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem4" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem4"> {{tankVehicleTemplate.checkItem4Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">罐体两边防护网是否完整</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem5">
                                <input v-if="!tankVehicleTemplate.checkItem5"  maxlength="100"   v-model="tankVehicleTemplate.checkItem5Msg" :placeholder="placeholderTxt"/>
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem5" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem5"> {{tankVehicleTemplate.checkItem5Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">轮胎是否符合行车安全要求</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem6">
                                <input v-if="!tankVehicleTemplate.checkItem6"  maxlength="100"   v-model="tankVehicleTemplate.checkItem6Msg" :placeholder="placeholderTxt" />
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem6" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem6"> {{tankVehicleTemplate.checkItem6Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">灭火器是否合格</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem7">
                                <input v-if="!tankVehicleTemplate.checkItem7"  maxlength="100"   v-model="tankVehicleTemplate.checkItem7Msg" :placeholder="placeholderTxt"/>
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem7" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem7"> {{tankVehicleTemplate.checkItem7Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">确认罐体上喷涂的介质名称是否与《公告》、《合格证》上记载的一致</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem8">
                                <input v-if="!tankVehicleTemplate.checkItem8"  maxlength="100"   v-model="tankVehicleTemplate.checkItem8Msg" :placeholder="placeholderTxt" />
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem8" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem8"> {{tankVehicleTemplate.checkItem8Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">喷涂的介质与记载的内容一致，运输介质属于国家安监总局等五部委文件《关于明确在用液体危险货物罐车加装紧急切断装置液体介质范围的通知》（安监总管三〔2014〕135号）中列举的17种介质范围。检查其卸料口处是否安装有紧急切断阀、紧急切断阀是否有远程控制系统。</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem9">
                                <input v-if="!tankVehicleTemplate.checkItem9"  maxlength="100"   v-model="tankVehicleTemplate.checkItem9Msg" :placeholder="placeholderTxt" />
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem9" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem9"> {{tankVehicleTemplate.checkItem9Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">检查紧急切断阀有无腐蚀、生锈、裂纹等缺陷，有无松脱、渗漏等现象，检查紧急切断阀控制按钮是否完好。</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem10">
                                <input v-if="!tankVehicleTemplate.checkItem10"  maxlength="100"   v-model="tankVehicleTemplate.checkItem10Msg" :placeholder="placeholderTxt"/>
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem10" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem10"> {{tankVehicleTemplate.checkItem10Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3">检查紧急切断阀是否处于关闭状态，没有关闭的要求当场关闭，并对驾驶人进行一次面对面的教育提示。</td>
                    <td colspan="2">
                        <div v-if="editable">
                            <el-checkbox v-model="tankVehicleTemplate.checkItem11">
                                <input v-if="!tankVehicleTemplate.checkItem11"  maxlength="100"   v-model="tankVehicleTemplate.checkItem11Msg" :placeholder="placeholderTxt"/>
                            </el-checkbox>
                        </div>
                        <div v-else>
                            <el-checkbox v-model="tankVehicleTemplate.checkItem11" disabled>
                                <span v-if="!tankVehicleTemplate.checkItem11"> {{tankVehicleTemplate.checkItem11Msg}}</span>
                            </el-checkbox>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td class="per20" style="text-align: center;">处理意见</td>
                    <td colspan="4">
                        <textarea v-if="editable" v-model="tankVehicleTemplate.suggestion"  maxlength="500"   rows="5"></textarea>
                        <div v-else v-html="tankVehicleTemplate.suggestion"></div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: center;">检查人员签字（必须两人以上）</td>
                    <td colspan="3" style="width: 60%;">
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
                placeholderTxt:'请输入原因',
                noteVisible:false,
                note:'',
                orgCategories:[],
                areas:[],
                editable:false,
                uploadUrl:'',
                param:{type:'tankVehicleTemplate'},
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
                tankVehicleTemplate:{},
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
                window.location.href=this.$baseURL + "/" + row.url;
            },
            handleAvatarSuccess(res, file) {
                this.$message.success("上传成功!");
                this.getData();
            },
            beforeAvatarUpload(file) {
                const isLt5M = file.size / 1024 / 1024 < 5;
                const isWord = file.type==='application/msword';
                if (!isLt5M) {
                    this.$message.error('上传文件大小不能超过 5MB!');
                    return false
                }
                if(!isWord){
                    this.$message.error('只能上传work文档!');
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
                if(this.tankVehicleTemplate.suggestion){
                    this.tankVehicleTemplate.suggestion = this.tankVehicleTemplate.suggestion.replace(/<br>/g,"\n");
                }
            },
            saveContent(){
                if(this.tankVehicleTemplate.suggestion){
                    this.tankVehicleTemplate.suggestion = this.tankVehicleTemplate.suggestion.replace(/\n/g,"<br>");
                }
                this.$axios.post("/tankVehicleTemplate/content", this.$qs.stringify(this.tankVehicleTemplate)).then(res => {
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
                this.tankVehicleTemplate=row;
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
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/tankVehicleTemplate/tankVehicleTemplatesByPage",{
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
                this.form=row;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/tankVehicleTemplate/tankVehicleTemplate/" + row.id).then(res => {
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
                }else if(row.province && row.city){
                    this.form.area=[row.province.id,row.city.id];
                }else if(row.province){
                    this.form.area=[row.province.id];
                }
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.form.content='';
                        this.$axios.put("/tankVehicleTemplate/tankVehicleTemplate?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/tankVehicleTemplate/tankVehicleTemplate",this.$qs.stringify(this.form)).then(res=>{
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
        text-align: left;
        height:30px;
        line-height: 30px;
        padding-left: 5px;
    }
    td input,td textarea{
        border: none;
        font-size: 16px;
        width: 98%;
        padding: 3px;
    }

    td div{
        text-align: left;
        padding-left: 5px;
    }
</style>
