<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 安全投入台账
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
                        icon="el-icon-edit"
                        class="handle-del mr10"
                        @click="usePlan"
                >安全生产费用使用计划</el-button>
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
                <el-table-column prop="billingDate" label="开票日期" :formatter="dateFormatter"></el-table-column>
                <el-table-column prop="safetyProductionCostPlan.serialNo" label="类别"></el-table-column>
                <el-table-column prop="content" label="内容摘要"></el-table-column>
                <el-table-column prop="sumOfMoney" label="金额(元)"></el-table-column>
                <el-table-column prop="billNo" label="票据号码"></el-table-column>
                <el-table-column prop="operator" label="经办人"></el-table-column>
                <el-table-column prop="note" label="备注"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%" @close="closeDialog" @open="loadData">
            <el-form ref="form" :model="form" :rules="rules"  label-width="90px">
                <el-form-item label="开票日期" prop="billingDate">
                    <el-date-picker style="width: 100%;"
                            v-model="form.billingDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="类别" prop="safetyProductionCostPlanId">
                    <el-select v-model="form.safetyProductionCostPlanId" placeholder="请选择" style="width: 100%;" >
                        <el-option
                                v-for="item in safetyProductionCostPlans"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="金额(元)" prop="sumOfMoney">
                    <el-input-number v-model="form.sumOfMoney"></el-input-number>
                </el-form-item>
                <el-form-item label="票据号码">
                    <el-input v-model="form.billNo"></el-input>
                </el-form-item>
                <el-form-item label="内容摘要">
                    <el-input v-model="form.content" type="textarea" :rows="3"></el-input>
                </el-form-item>
                <!--<el-form-item label="经办人">
                    <el-input v-model="form.operator"></el-input>
                </el-form-item>-->
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
        <el-dialog title="新增" :visible.sync="addVisible" width="30%"  @close="closeDialog" @open="loadData">
            <el-form ref="form" :model="form" :rules="rules"  label-width="90px">
                <el-form-item label="开票日期" prop="billingDate">
                    <el-date-picker style="width: 100%;"
                            v-model="form.billingDate"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="类别" prop="safetyProductionCostPlanId">
                    <el-select v-model="form.safetyProductionCostPlanId" placeholder="请选择" style="width: 100%;" >
                        <el-option
                                v-for="item in safetyProductionCostPlans"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="金额(元)" prop="sumOfMoney">
                    <el-input-number v-model="form.sumOfMoney"></el-input-number>
                </el-form-item>
                <el-form-item label="票据号码">
                    <el-input v-model="form.billNo"></el-input>
                </el-form-item>
                <el-form-item label="内容摘要">
                    <el-input v-model="form.content" type="textarea" :rows="3"></el-input>
                </el-form-item>
                <!--<el-form-item label="经办人">
                    <el-input v-model="form.operator"></el-input>
                </el-form-item-->
                <el-form-item label="备注">
                    <el-input v-model="form.note" type="textarea" :rows="3"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 安全生产费用使用计划 -->
        <el-dialog title="" :visible.sync="usePlanVisible" width="70%"   @open="findPlan">
            <form :model="safetyProductionCost">
                <table style="width: 100%;">
                    <caption>{{safetyProductionCost.title}}</caption>
                    <div style="float: right;">单位：元</div>
                    <tr>

                    </tr>
                </table>
            </form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="usePlanVisible=false">取 消</el-button>
                <el-button type="primary" @click="saveUsePlan">保存</el-button>
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
                    pageIndex: 1,
                    pageSize: 10
                },
                tableData: [],
                safetyProductionCostPlans:[],
                safetyProductionCost:{},
                delList: [],
                editVisible: false,
                addVisible: false,
                usePlanVisible:false,
                pageTotal: 0,
                form: {},
                idx: -1,
                id: -1,
                rules:{
                    safetyProductionCostPlanId: [
                        { required: true, message: '请选择类别', trigger: ['blur','change'] }
                    ],
                    billingDate: [
                        { required: true, message: '请选择开票日期', trigger:'blur'}
                    ],
                    sumOfMoney: [
                        { required: true, message: '请填写金额', trigger:'blur'}
                    ],
                    billNo: [
                        { required: true, message: '请填写票号', trigger:'blur'}
                    ]
                }
            };
        },
        created() {
            this.getData();
        },
        methods: {
            saveUsePlan(){

            },
            //显示或编辑安全生产费用使用计划
            usePlan(){
                this.usePlanVisible = true;
            },
            findPlan(){
                this.$axios.get("/safetyProductionCost/safetyProductionCost").then(res =>{
                    this.safetyProductionCost = res.data;
                    this.safetyProductionCost.title=res.data.safetyYear+"年度安全生产费用提取和使用计划";
                    this.safetyProductionCostPlans = res.data.plans;
                }).catch(error => console.log(error));
            },
            handleAdd(){
                this.addVisible=true;
                this.form={};
                this.$refs["form"].clearValidate();
            },
            loadData(){
                this.$axios.get("/safetyProductionCostPlan/safetyProductionCostPlan").then(res=>{
                    this.safetyProductionCostPlans = res.data;
                }).catch(error=>console.log(error))
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
                this.$axios.get("/safetyProductionCostPlanDetail/safetyProductionCostPlanDetailsByPage",{
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
                        this.$axios.delete("/safetyProductionCostPlanDetail/safetyProductionCostPlanDetail/" + this.form.id).then(res => {
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
                if(row.safetyProductionCostPlan){
                    this.form.safetyProductionCostPlanId = row.safetyProductionCostPlan.id;
                }
                this.editVisible = true;
                this.$refs["form"].clearValidate();
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    console.log(this.form);
                    if (validate) {
                        this.$axios.put("/safetyProductionCostPlanDetail/safetyProductionCostPlanDetail?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/safetyProductionCostPlanDetail/safetyProductionCostPlanDetail",this.$qs.stringify(this.form)).then(res=>{
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
</style>
