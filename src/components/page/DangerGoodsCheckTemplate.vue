<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 危险货物自查模板
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
                    <el-input v-model="form.note" type="textarea" :rows="3"></el-input>
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
                    <el-input v-model="form.note" type="textarea" :rows="3"></el-input>
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
        <el-dialog title="模板内容" :visible.sync="showContentVisible" width="70%">
            <table style="width: 100%;" cellspacing="0" cellpadding="0">
                <caption style="margin-bottom: 20px;font-size: 18px;">{{dangerGoodsCheckTemplate.name}}</caption>

                <thead>
                <tr>
                    <th style="width:10%;">检查时间</th>
                    <th style="width:12%;">被检单位名称</th>
                    <th style="width:17%;">存在的安全隐患</th>
                    <th style="width:17%;">整改措施</th>
                    <th style="width:8%;">整改时限</th>
                    <th style="width:8%;">责任人</th>
                    <th style="width:8%;">整改到位时间</th>
                    <th style="width:8%;">销号时间</th>
                    <th style="width:12%;">备注</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="detail in details">
                    <td>
                        <span v-if="editable">
                            <el-date-picker
                                    style="width: 150px;"
                                    v-model="detail.checkDate"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="选择日期">
                             </el-date-picker>
                        </span>
                        <span v-else>
                            {{detail.checkDate | formatDate}}
                        </span>
                    </td>
                    <td>
                        <span v-if="editable">
                            <textarea type="text" v-model="detail.checkedOrg"></textarea>
                        </span>
                        <span v-else>
                            {{detail.checkedOrg}}
                        </span>
                    </td>
                    <td style="text-align: left;padding-left:3px;">
                        <span v-if="editable">
                            <textarea type="text" v-model="detail.hiddenDanger" rows="5"></textarea>
                        </span>
                        <span v-else v-html="detail.hiddenDanger" >
                        </span>
                    </td>
                    <td>
                        <span v-if="editable">
                            <textarea type="text" v-model="detail.correctiveAction" rows="5"></textarea>
                        </span>
                        <span v-else v-html="detail.correctiveAction">
                        </span>
                    </td>
                    <td>
                        <span v-if="editable">
                            <input type="text" v-model="detail.timelimit" />
                        </span>
                        <span v-else>
                            {{detail.timelimit}}
                        </span>
                    </td>
                    <td>
                        <span v-if="editable">
                            <input type="text" v-model="detail.person" />
                        </span>
                        <span v-else>
                            {{detail.person}}
                        </span>
                    </td>
                    <td>
                        <span v-if="editable">
                            <el-date-picker
                                    style="width: 150px;"
                                    v-model="detail.endTime"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="选择日期">
                             </el-date-picker>
                        </span>
                        <span v-else>
                            {{detail.endTime | formatDate}}
                        </span>
                    </td>
                    <td>
                        <span v-if="editable">
                            <el-date-picker
                                    style="width: 150px;"
                                    v-model="detail.cancelDate"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="选择日期">
                             </el-date-picker>
                        </span>
                        <span v-else>
                            {{detail.cancelDate | formatDate}}
                        </span>
                    </td>
                    <td>
                        <span v-if="editable">
                            <textarea type="text" v-model="detail.detailNote" rows="5"></textarea>
                        </span>
                        <span v-else v-html="detail.detailNote">
                        </span>
                    </td>
                </tr>
                <tr>
                    <td colspan="9" style="border: none;text-align: left;">
                        <span>企业负责人签字：</span> <div style="width:200px;display: inline-block;">&nbsp;</div>
                        <span>安全检查组人员签字：</span>
                    </td>
                </tr>
                <tr v-if="editable">
                    <td colspan="9" style="border: none;">
                        <div style="width: 100%;text-align: center;">
                            <el-button type="text" @click="addLine">新增一行</el-button>
                        </div>
                    </td>
                </tr>
                </tbody>
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
                notices:[],
                tableData: [],
                delList: [],
                editVisible: false,
                uploadUrl:'',
                param:{type:'dangerGoodsCheckTemplate'},
                headers:{
                    token : localStorage.getItem("token")
                },
                addVisible: false,
                showContentVisible:false,
                pageTotal: 0,
                haveOrg:false,
                details:[],
                dangerGoodsCheckTemplate:{},
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
            addLine(){
              this.details.push({id:'',checkDate:'',checkedOrg:'',hiddenDanger:'',correctiveAction:'',timelimit:'',person:'',endTime:'',cancelDate:'',note:''})
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
                if(this.details && this.details.length>0){
                    for(let i = 0;i<this.details.length;i++){
                        let detail = this.details[i];
                        detail.cancelDate = getDate(new Date(detail.cancelDate));
                        detail.checkDate = getDate(new Date(detail.checkDate));
                        detail.endTime = getDate(new Date(detail.endTime));
                        if(detail.hiddenDanger){
                            detail.hiddenDanger = detail.hiddenDanger.replace(/<br>/g,"\n");
                        }
                        if(detail.correctiveAction){
                            detail.correctiveAction = detail.correctiveAction.replace(/<br>/g,"\n");
                        }
                        if(detail.detailNote){
                            detail.detailNote = detail.detailNote.replace(/<br>/g,"\n");
                        }
                    }
                }
            },
            saveContent(){
                let details = '';
                if(this.details && this.details.length>0){
                    for(let i = 0;i<this.details.length;i++){
                        let detail = this.details[i];
                        if(!detail.checkDate &&!detail.person&&!detail.cancelDate&&!detail.checkedOrg&&!detail.hiddenDanger
                        &&!detail.correctiveAction&&!detail.timelimit&&!detail.endTime&&!detail.detailNote){

                        }else{
                            if(detail.hiddenDanger){
                                detail.hiddenDanger = detail.hiddenDanger.replace(/\n/g,"<br>");
                            }
                            if(detail.correctiveAction){
                                detail.correctiveAction = detail.correctiveAction.replace(/\n/g,"<br>");
                            }
                            if(detail.detailNote){
                                detail.detailNote = detail.detailNote.replace(/\n/g,"<br>");
                            }
                            details+=detail.checkDate + "|" + detail.person + "|" + detail.cancelDate + "|" + detail.checkedOrg + "|" +
                                    detail.hiddenDanger + "|" + detail.correctiveAction + "|" + detail.timelimit + "|" + detail.endTime + "|" + detail.detailNote;
                            if(i<this.details.length-1){
                                details+="#";
                            }
                        }
                    }
                }
                let formData = new FormData();
                formData.append("id",this.dangerGoodsCheckTemplate.id);
                formData.append("details",details);
                this.$axios.post("/dangerGoodsCheckTemplate/content", formData).then(res => {
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
                this.dangerGoodsCheckTemplate=row;
                this.showContentVisible=true;
                this.editable = false;
                this.$axios.get("dangerGoodsCheckDetail/dangerGoodsCheckDetail",{
                    params:{
                        id:row.id
                    }
                }).then(res=>{
                    this.details = res.data;
                }).catch(error=>{
                    console.log(error);
                });
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
                this.$axios.get("/dangerGoodsCheckTemplate/dangerGoodsCheckTemplatesByPage",{
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
                        this.$axios.delete("/dangerGoodsCheckTemplate/dangerGoodsCheckTemplate/" + row.id).then(res => {
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
                        this.$axios.put("/dangerGoodsCheckTemplate/dangerGoodsCheckTemplate?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/dangerGoodsCheckTemplate/dangerGoodsCheckTemplate",this.$qs.stringify(this.form)).then(res=>{
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
    .per80{
        width:80%;
    }

    tr td,tr th{
        border: black solid 1px;
        text-align: center;
        height:30px;
        line-height: 30px;
    }
    td input,td textarea{
        border: none;
        font-size: 14px;
        width: 93%;
        padding: 3px;
    }

    td div{
        text-align: left;
        padding-left: 5px;
    }
</style>
