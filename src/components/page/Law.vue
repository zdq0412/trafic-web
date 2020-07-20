<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 法律法规政策-<span style="color:red;">{{(org.province==null?'':org.province)+(org.city==null?'':org.city)+(org.region==null?'':org.region)}}
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
                        <span style="cursor: pointer;color:#409EFF;" @click="showContent(scope.row)">{{ scope.row.law.name }}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="law.publishDate" label="发布日期" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="law.implementDate" label="实施日期" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="law.publishDepartment" label="发文部门"></el-table-column>
                <el-table-column prop="law.num" label="发文字号"></el-table-column>
                <el-table-column prop="law.timeliness" label="时效性"></el-table-column>
                <el-table-column prop="law.note" label="备注">
                    <template scope="scope">
                        <span style="cursor: pointer;color:#409EFF;" @click="showNote(scope.row.law.note)">{{ scope.row.law.note }}</span>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="220" align="center">
                    <template slot-scope="scope">
                        <el-button
                                type="text"
                                style="color: #67C23A;"
                                icon="el-icon-video-play"
                                @click="handleExecute(scope.$index, scope.row)"
                        > <span v-if="scope.row.sended">重新发文</span><span v-else>发文执行</span></el-button>
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
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="发布日期" prop="publishDate">
                    <el-date-picker
                            v-model="form.publishDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="实施日期" prop="implementDate">
                    <el-date-picker
                            v-model="form.implementDate"
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
                            :props="{label:'name',value:'name'}"
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
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="30%"  @close="closeDialog" @open="loadData">
            <el-form ref="form" :model="form" :rules="rules"  label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="发布日期" prop="publishDate">
                    <el-date-picker
                            v-model="form.publishDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="实施日期" prop="implementDate">
                    <el-date-picker
                            v-model="form.implementDate"
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
                            :props="{label:'name',value:'name'}"
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
        <el-dialog title="文本内容" :visible.sync="showContentVisible" width="30%">
            <div v-html="form.content"></div>
            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="showContentVisible=false,editContentVisible=true">编辑</el-button>
                <el-button  @click="showContentVisible=false">关闭</el-button>
            </span>
        </el-dialog>
        <!--编辑文本内容-->
        <el-dialog title="编辑内容" :visible.sync="editContentVisible" width="30%">
            <el-form ref="form" :rules="rules" :model="form" label-width="100px">
               <!-- <el-row type="flex" class="row-bg">
                    <el-col>
                        <el-form-item label="">
                            <vue-editor id="editor" v-model="form.content" :editor-toolbar="customToolbar" useCustomImageHandler></vue-editor>
                        </el-form-item>
                    </el-col>
                </el-row>-->
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
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                showContentVisible:false,
                editContentVisible:false,
                pageTotal: 0,
                haveOrg:false,
                form: {
                },
                idx: -1,
                org:{},
                id: -1,
                areas:[],
                rules:{
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ],
                    publishDate:[
                        { required: true, message: '请选择发布日期', trigger: 'blur' }
                    ],
                    area:[
                        { required: true, message: '请选择区域', trigger: 'blur' }
                    ],
                    orgCategoryId:[
                        { required: true, message: '请选择企业类别', trigger: 'blur' }
                    ],
                    timeliness:[
                        { required: true, message: '请选择时效性', trigger: 'blur' }
                    ],
                    content:[
                        { required: true, message: '请输入文本内容', trigger: 'blur' }
                    ],
                    implementDate:[
                        { required: true, message: '请选择实施日期', trigger: 'blur' }
                    ]
                }
            };
        },
        created() {
            this.getData();
            this.$axios.get("/user/haveOrg").then(res =>{
                if(res.data.data){
                    this.haveOrg = true;
                    this.org = res.data.data;
                }
            }).catch(error=>console.log(error));
        },
        methods: {
            handleExecute(index,row){
                if(!row.law.content){
                    this.$message.error("该文件内容为空，不能发布!");
                    return false;
                }
                this.$confirm('确定要发布该通知吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {

                        this.$axios.get("/law/publishLaw" ,{
                            params:{
                                id:row.id
                            }
                        } ).then(res => {
                            if(res.data.result.resultCode==200){
                                this.$message.success('发布成功，请到企业发文通知中查看!');
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
            saveContent(){
                this.$axios.put("/law/content?" + this.$qs.stringify(this.form)).then(res => {
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
                this.form = row.law;
                this.showContentVisible=true;
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
                    this.form.province=this.form.area[0];
                    this.form.city=this.form.area[1];
                    this.form.region=this.form.area[2];
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
                this.$axios.get("/law/lawsByPage",{
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
                this.form=row.law;
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/law/law/" + row.id).then(res => {
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
                this.form = row.law;
                this.editVisible = true;
                if(row.law.publishDate){
                    this.form.publishDate = getDate(new Date(row.law.publishDate));
                }
                if(row.law.implementDate){
                    this.form.implementDate = getDate(new Date(row.law.implementDate));
                }
                if(row.law.orgCategory){
                    this.form.orgCategoryId = row.law.orgCategory.id;
                }
                this.form.area=[row.law.province,row.law.city,row.law.region];
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.put("/law/law?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/law/law",this.$qs.stringify(this.form)).then(res=>{
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
