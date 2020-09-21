<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> GPS监控台账
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
                <el-table-column prop="carNum" label="车牌号码" ></el-table-column>
                <el-table-column prop="driveDate" label="行驶时间" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="driverName" label="驾驶员姓名"></el-table-column>
                <el-table-column prop="driveLines" label="运营路线"></el-table-column>
                <el-table-column prop="goodsName" label="货物名称"></el-table-column>
                <el-table-column prop="carStatus" label="车辆运行状况"></el-table-column>
                <el-table-column prop="gpsStatus" label="GPS运行状况"></el-table-column>
                <el-table-column prop="illegal" label="是否有违法违章行为">
                    <template slot-scope="scope">
                        <span v-if="!scope.row.illegal">没有</span>
                        <span v-else>有</span>
                    </template>
                </el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="250" align="center">
                    <template slot-scope="scope">
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="40%" @close="closeDialog">
            <el-form ref="editForm" :model="editableForm" :rules="rules"  label-width="120px">
                <el-form-item label="车牌号码" prop="carNum">
                    <el-input v-model="editableForm.carNum"  maxlength="10"></el-input>
                </el-form-item>
                <el-form-item label="行驶时间" prop="driveDate">
                    <el-date-picker style="width: 100%;"
                                    v-model="editableForm.driveDate"
                                    type="datetime"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="驾驶员姓名">
                    <el-input v-model="editableForm.driverName"  maxlength="50"></el-input>
                </el-form-item>
                <el-form-item label="货物名称">
                    <el-input v-model="editableForm.goodsName"  maxlength="50"></el-input>
                </el-form-item>
                <el-form-item label="运营路线">
                    <el-input v-model="editableForm.driveLines"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="车辆运行状况">
                    <el-input v-model="editableForm.carStatus"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="GPS运行状况">
                    <el-input v-model="editableForm.gpsStatus"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="有无违法违章行为">
                    <el-select v-model="editableForm.illegal" placeholder="请选择">
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="editableForm.note"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false;editableForm=JSON.parse(JSON.stringify(form));">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="40%"  @close="closeDialog">
            <el-form ref="form" :model="form" :rules="rules"  label-width="120px">
                <el-form-item label="车牌号码" prop="carNum">
                    <el-input v-model="form.carNum"  maxlength="10"></el-input>
                </el-form-item>
                <el-form-item label="行驶时间" prop="driveDate">
                    <el-date-picker style="width: 100%;"
                                    v-model="form.driveDate"
                                    type="datetime"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="驾驶员姓名">
                    <el-input v-model="form.driverName"  maxlength="10"></el-input>
                </el-form-item>
                <el-form-item label="货物名称">
                    <el-input v-model="form.goodsName"  maxlength="50"></el-input>
                </el-form-item>
                <el-form-item label="运营路线">
                    <el-input v-model="form.driveLines"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="车辆运行状况">
                    <el-input v-model="form.carStatus"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="GPS运行状况">
                    <el-input v-model="form.gpsStatus"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
                <el-form-item label="有无违法违章行为">
                    <el-select v-model="form.illegal" placeholder="请选择">
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note"  maxlength="500" type="textarea"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
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
                    <!--<template scope="scope">
                        <span style="cursor: pointer;color:#409EFF;" @click="showNote(scope.row.note)">{{ scope.row.note }}</span>
                    </template>-->
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
    import {getDateTime} from "../common/utils";
    export default {
        name: 'basetable',
        data() {
            return {
                query: {
                    pageIndex: 1,
                    pageSize: 10,
                },
                templateVisible:false,
                templates: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageTotal:0
                },
                template:{},
                templatesVisible:false,
                tableData: [],
                delList: [],
                editVisible: false,
                addVisible: false,
                org:{},
                pageTotal: 0,
                options:[
                    {
                        label:'没有',
                        value:false
                    },{
                    label:'有',
                        value:true
                    }
                ],
                form: {},
                editableForm: {},
                idx: -1,
                id: -1,
                rules:{
                    driveDate: [
                        { required: true, message: '请选择行驶日期', trigger:'blur'}
                    ],
                    carNum: [
                        { required: true, message: '请输入车牌号', trigger:'blur'}
                    ]
                }
            };
        },
        created() {
            this.$axios.get("/user/haveOrg").then(res =>{
                if(res.data.data){
                    this.org = res.data.data;
                }
            }).catch(error=>console.log(error));
            this.getData();
        },
        methods: {
            downloadTemplate(index,row){
                // window.location.href=this.$baseURL + "/" + row.url;
                window.open(this.$baseURL + "/" + row.url);
            },
            //查找模板
            findTemplates(){
                this.$axios.get("/gpsAccountTemplate/gpsAccountTemplatesByPage",{
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
            handleAdd(){
                this.addVisible=true;
                this.form={};
                this.$refs["form"].clearValidate();
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDateTime(new Date(cellValue));
                }else{
                    return '';
                }
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            getData() {
                this.$axios.get("/gpsAccount/gpsAccountsByPage",{
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
                        this.$axios.delete("/gpsAccount/gpsAccount/" + this.form.id).then(res => {
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
                this.editableForm=JSON.parse(JSON.stringify(this.form));
                if(row.driveDate){
                    this.form.driveDate = getDateTime(new Date(row.driveDate))
                    this.editableForm.driveDate = getDateTime(new Date(row.driveDate))
                }
                this.editVisible = true;
            },
            // 保存编辑
            saveEdit() {
                this.form = JSON.parse(JSON.stringify(this.editableForm));
                this.$refs.editForm.validate(validate => {
                    if (validate) {
                        this.$axios.put("/gpsAccount/gpsAccount?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/gpsAccount/gpsAccount",this.$qs.stringify(this.form)).then(res=>{
                            if(res.data.result.resultCode==200){
                                this.addVisible = false;
                                this.getData();
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
    table tr td{
        border: black solid 1px;
        text-align: center;
        height:30px;
        line-height: 30px;
    }
    .plan tr td{
        text-align: left;
        padding-left: 10px;
    }
    td input{
        border: none;
        font-size: 16px;
    }
</style>
