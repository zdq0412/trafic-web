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
                <el-button
                        type="success"
                        icon="el-icon-s-data"
                        class="handle-del mr10"
                        @click="statisticsVisible=true"
                >统计报表</el-button>
                <el-button
                        type="success"
                        icon="el-icon-s-data"
                        class="handle-del mr10"
                        @click="totalVisible=true"
                >汇总报表</el-button>
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
                <el-table-column label="操作" width="250" align="center">
                    <template slot-scope="scope">
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
                        <el-button
                                type="text"
                                icon="el-icon-upload2"
                                class="upload"
                                @click="upload(scope.$index, scope.row)"
                        >上传</el-button>
                        <el-button v-if="scope.row.realPath"
                                   type="text"
                                   icon="el-icon-download"
                                   class="download"
                                   @click="download(scope.$index, scope.row)"
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
        <el-dialog title="" :visible.sync="usePlanVisible" width="50%"   @open="findPlan">
            <el-form :model="safetyProductionCost">
                <div class="handle-box">
                    <el-form-item label="年份" label-width="60">
                        <el-date-picker
                                v-model="year"
                                type="year"
                                value-format="yyyy"
                                placeholder="选择年份">
                        </el-date-picker>
                        <el-button style="margin-left:10px;"
                                   type="primary"
                                   icon="el-icon-search"
                                   class="handle-del mr10"
                                   @click="findPlan"
                        >查找</el-button>
                    </el-form-item>
                </div>
                <table style="width: 100%;" cellspacing="0" cellpadding="0">
                    <caption>{{safetyProductionCost.title}}</caption>
                    <tr>
                        <td colspan="4" style="border: none;">
                            <div style="float: right;">单位:元</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="per30">上年度实际营业收入</td>
                        <td class="per20">
                            <input v-if="!safetyProductionCost.fillIn" v-model="safetyProductionCost.lastYearActualIncome" ref="lastYearActualIncome" @blur="checkMoney('lastYearActualIncome')"></input>
                            <div v-else>{{safetyProductionCost.lastYearActualIncome}}</div>
                        </td>
                        <td class="per30">本年度应提取的安全费用</td>
                        <td class="per20">
                            <input v-if="!safetyProductionCost.fillIn" v-model="safetyProductionCost.currentYearCost" ref="currentYearCost" @blur="checkMoney('currentYearCost')"></input>
                            <div v-else>{{safetyProductionCost.currentYearCost}}</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="per30">上年度结转安全费用</td>
                        <td class="per20">
                            <input v-if="!safetyProductionCost.fillIn" v-model="safetyProductionCost.lastYearCarryCost" ref="lastYearCarryCost" @blur="checkMoney('lastYearCarryCost')" ></input>
                            <div v-else>{{safetyProductionCost.lastYearCarryCost}}</div>
                        </td>
                        <td class="per30">本年度实际可用安全费用</td>
                        <td class="per20">
                            <input v-if="!safetyProductionCost.fillIn" v-model="safetyProductionCost.currentYearActualCost" ref="currentYearActualCost" @blur="checkMoney('currentYearActualCost')"></input>
                            <div v-else>{{safetyProductionCost.currentYearActualCost}}</div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            本年度各类安全生产费用使用计划
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <table class="plan" cellspacing="0" cellpadding="0" style="width: 100%;">
                                <tr>
                                    <td style="width: 70%;text-align: center;">安全生产费用支出类别</td>
                                    <td style="width: 30%;text-align: center;">计划使用金额</td>
                                </tr>
                                <tr v-for="(plan,index) in safetyProductionCostPlans">
                                    <td style="width: 70%;">{{plan.name}}</td>
                                    <td style="width: 30%;">
                                        <input v-if="!safetyProductionCost.fillIn" v-model="safetyProductionCostPlans[index].planCost" :ref="'plan'+index" @blur="checkMoney('plan',index)"></input>
                                        <div v-else>{{safetyProductionCostPlans[index].planCost}}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="usePlanVisible=false">取 消</el-button>
                <el-button v-if="!safetyProductionCost.fillIn" type="primary" @click="saveUsePlan">保存</el-button>
            </span>
        </el-dialog>
        <!--道路运输企业安全生产费用提取和使用情况统计表-->
        <el-dialog title="" :visible.sync="statisticsVisible" width="50%"   @open="statistics">
            <el-form :model="safetyProductionCost">
                <div class="handle-box">
                    <el-form-item label="日期" label-width="60">
                        <el-date-picker v-if="query.type=='year'"
                                        v-model="query.date"
                                        type="year"
                                        value-format="yyyy-MM-dd"
                                        placeholder="选择日期">
                        </el-date-picker>
                        <el-date-picker v-else
                                        v-model="query.date"
                                        type="month"
                                        value-format="yyyy-MM-dd"
                                        placeholder="选择日期">
                        </el-date-picker>
                        <el-radio v-model="query.type" label="year" style="margin-left:10px;">按年</el-radio>
                        <el-radio v-model="query.type" label="month">按月</el-radio>
                        <el-button style="margin-left:10px;"
                                   type="primary"
                                   icon="el-icon-search"
                                   class="handle-del mr10"
                                   @click="statistics"
                        >查找</el-button>
                    </el-form-item>
                </div>
                <table style="width: 100%;" cellspacing="0" cellpadding="0">
                    <caption>{{safetyProductionCost.title}}</caption>
                    <tr>
                        <td colspan="4" style="border: none;">
                            <div style="float: right;">单位:元</div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <table style="width: 100%;" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="width:20%;">企业名称（公 章）</td>
                                    <td style="width:45%;">{{org.name}} </td>
                                    <td style="width:15%;">法定代表人</td>
                                    <td style="width:20%;">{{org.legalPerson}}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td class="per30">上年度实际营业收入</td>
                        <td class="per20">
                            <div>{{safetyProductionCost.lastYearActualIncome}}</div>
                        </td>
                        <td class="per30">本年度应提取的安全费用</td>
                        <td class="per20">
                            <div>{{safetyProductionCost.currentYearCost}}</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="per30">上年度结转安全费用</td>
                        <td class="per20">
                            <div>{{safetyProductionCost.lastYearCarryCost}}</div>
                        </td>
                        <td class="per30">本年度实际可用安全费用</td>
                        <td class="per20">
                            <div>{{safetyProductionCost.currentYearActualCost}}</div>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="3">
                            本年度截止月日已投入使用的各类安全生产费用合计
                        </td>
                        <td>{{safetyProductionCost.total}} </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            <table class="plan" cellspacing="0" cellpadding="0" style="width: 100%;">
                                <tr>
                                    <td style="width: 70%;text-align: center;">安全生产费用支出类别</td>
                                    <td style="width: 30%;text-align: center;">支出金额</td>
                                </tr>
                                <tr v-for="(plan,index) in safetyProductionCostPlans">
                                    <td style="width: 70%;">{{plan.name}}</td>
                                    <td style="width: 30%;">
                                        <div>{{safetyProductionCostPlans[index].planCost}}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="4">
                            备注：1、财政部、国家安全生产监督管理总局制定的《企业安全生产经费提取和使用管理办法》（财企〔2012〕16号）第九条规定，交通运输企业以上年度实际营业收入为计提依据，按照以下标准平均逐月提取：（一）普通货运业务按照1%提取；（二）客运业务、管道运输、危险品等特殊货运业务按照1.5%提取。
                        </td>
                    </tr>
                </table>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="statisticsVisible=false">关闭</el-button>
            </span>
        </el-dialog>
        <!--年度安全生产费用提取和使用情况汇总表-->
        <el-dialog title="" :visible.sync="totalVisible" width="80%"   @open="total">
            <el-form :model="safetyProductionCost">
                <div class="handle-box">
                    <el-form-item label="年份" label-width="60">
                        <el-date-picker
                                v-model="safetyYear"
                                type="year"
                                value-format="yyyy"
                                placeholder="选择年份">
                        </el-date-picker>
                        <el-button style="margin-left:10px;"
                                   type="primary"
                                   icon="el-icon-search"
                                   class="handle-del mr10"
                                   @click="total"
                        >查找</el-button>
                    </el-form-item>
                </div>
                <table style="width: 100%;" cellspacing="0" cellpadding="0">
                    <caption>{{safetyProductionCost.title}}</caption>
                    <tr>
                        <td style="border: none;">
                            <div style="float: right;">单位:元</div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table style="width: 100%;" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="width:20%;">上年度实际营业收入</td>
                                    <td style="width:15%;">
                                        <div>{{safetyProductionCost.lastYearActualIncome}}</div>
                                    </td>
                                    <td style="width:20%;">本年度应提取的安全费用</td>
                                    <td style="width:15%;">
                                        <div>{{safetyProductionCost.currentYearCost}}</div>
                                    </td>
                                    <td style="width:15%;">上年度结转</td>
                                    <td style="width:15%;">
                                        <div>{{safetyProductionCost.lastYearCarryCost}}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="width:20%;">本年度实际可用安全费用</td>
                                    <td style="width:15%;">
                                        <div>{{safetyProductionCost.currentYearActualCost}}</div>
                                    </td>
                                    <td style="width:20%;">本年度实际使用支出的安全费用</td>
                                    <td style="width:15%;">
                                        <div>{{safetyProductionCost.currentYearActualUsed}}</div>
                                    </td>
                                    <td style="width:15%;">年度结余资金</td>
                                    <td style="width:15%;">
                                        <div>{{safetyProductionCost.costLeft}}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table class="plan" cellspacing="0" cellpadding="0" style="width: 100%;">
                                <tr>
                                    <td style="width: 40%;text-align: center;">安全生产费用支出类别（每月）</td>
                                    <td>1</td>
                                    <td>2</td>
                                    <td>3</td>
                                    <td>4</td>
                                    <td>5</td>
                                    <td>6</td>
                                    <td>7</td>
                                    <td>8</td>
                                    <td>9</td>
                                    <td>10</td>
                                    <td>11</td>
                                    <td>12</td>
                                    <td>小计</td>
                                </tr>
                                <tr v-for="(plan,index) in plans">
                                    <td>{{plan.name}}</td>
                                    <td>
                                        <div>{{plan.oneMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.twoMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.threeMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.fourMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.fiveMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.sixMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.sevenMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.eightMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.nineMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.tenMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.elevenMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.twelveMonth}}</div>
                                    </td>
                                    <td>
                                        <div>{{plan.total}}</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="totalVisible=false">关闭</el-button>
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
                    pageSize: 10,
                    date:'',
                    type:'year'
                },

                uploadUrl:'',
                param:{type:'contract'},
                headers:{
                    token : localStorage.getItem("token")
                },
                ext:'.doc,.docx,.jpg,.jpeg,.bmp,.rar,.zip,.png,.pdf',

                tableData: [],
                safetyProductionCostPlans:[],
                safetyProductionCost:{},
                delList: [],
                plans:[],
                editVisible: false,
                addVisible: false,
                usePlanVisible:false,
                statisticsVisible:false,
                totalVisible:false,
                safetyYear:'',
                year:'',
                org:{},
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
            this.uploadUrl = this.$baseURL + "/safetyAccountUpload";
            this.$axios.get("/user/haveOrg").then(res =>{
                if(res.data.data){
                    this.org = res.data.data;
                }
            }).catch(error=>console.log(error));
            this.getData();
        },
        methods: {
            upload(index,row){
                this.$refs.uploadFile.clearFiles();
                this.param.id=row.id;
                this.$refs.fileUploadBtn.$el.click();
            },
            download(index,row){
                window.location.href=this.$baseURL + "/" + row.url;
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
                    return false
                }
                return  true;
            },
            //年度安全生产费用提取和使用情况汇总表
            total(){
                //道路运输企业安全生产费用提取和使用情况统计表
                this.$axios.get("/safetyProductionCost/total",{
                    params:{
                        year:this.safetyYear
                    }
                }).then(res=>{
                    this.safetyProductionCost = res.data;
                    this.safetyProductionCost.title=res.data.safetyYear + "年度安全生产费用提取和使用情况汇总表";
                    this.plans = this.safetyProductionCost.plans;
                    if(this.plans && this.plans.length>0){
                        let oneMonth=0,
                            twoMonth=0,
                            threeMonth=0,
                            fourMonth=0,
                            fiveMonth=0,
                            sixMonth=0,
                            sevenMonth=0,
                            eightMonth=0,
                            nineMonth=0,
                            tenMonth=0,
                            elevenMonth=0,
                            twelveMonth=0,
                            total=0;//小计
                        for(let i = 0;i<this.plans.length;i++){
                            let plan = this.plans[i];
                            plan.total = plan.oneMonth + plan.twoMonth + plan.threeMonth +
                                    plan.fourMonth + plan.fiveMonth + plan.sixMonth + plan.sevenMonth +
                                    plan.eightMonth + plan.nineMonth + plan.tenMonth + plan.elevenMonth + plan.twelveMonth;
                            oneMonth += plan.oneMonth;
                            twoMonth += plan.twoMonth;
                            threeMonth += plan.threeMonth;
                            fourMonth += plan.fourMonth;
                            fiveMonth += plan.fiveMonth;
                            sixMonth += plan.sixMonth;
                            sevenMonth += plan.sevenMonth;
                            eightMonth += plan.eightMonth;
                            nineMonth += plan.nineMonth;
                            tenMonth += plan.tenMonth;
                            elevenMonth += plan.elevenMonth;
                            twelveMonth += plan.twelveMonth;
                            total += plan.total;
                        }
                        this.plans.push({name:"合  计",oneMonth:oneMonth,twoMonth:twoMonth,threeMonth:threeMonth,fourMonth:fourMonth,
                            fiveMonth:fiveMonth,sixMonth:sixMonth,sevenMonth:sevenMonth,eightMonth:eightMonth,nineMonth:nineMonth,tenMonth:tenMonth,
                            elevenMonth:elevenMonth,twelveMonth:twelveMonth,total:total})
                    }else{
                        this.plans.push({name:"合  计",oneMonth:"",twoMonth:"",threeMonth:"",fourMonth:"",fiveMonth:"",sixMonth:"",sevenMonth:"",eightMonth:"",nineMonth:"",tenMonth:"",elevenMonth:"",twelveMonth:"",total:""});
                    }
                }).catch(error=>console.log(error));
            },
            //道路运输企业安全生产费用提取和使用情况统计表
            statistics(){
                this.$axios.get("/safetyProductionCost/statistics",{
                    params:{
                        date:this.query.date,
                        type:this.query.type
                    }
                }).then(res=>{
                    this.safetyProductionCost = res.data;
                    this.safetyProductionCostPlans = this.safetyProductionCost.plans;
                }).catch(error=>console.log(error));
            },
            checkMoney(ref,index){
                let reg =/^[0-9]*$/;
                switch (ref) {
                    case 'lastYearActualIncome':{
                        if(!reg.test(this.safetyProductionCost.lastYearActualIncome)){
                            this.$message.error("上年度实际营业收入必须为数值!");
                            this.$refs.lastYearActualIncome.focus();
                            this.safetyProductionCost.lastYearActualIncome=0;
                        }else{
                            this.safetyProductionCost.currentYearCost=this.safetyProductionCost.lastYearActualIncome*this.safetyProductionCost.org.orgCategory.safetyCostRatio/100 ;
                            this.safetyProductionCost.currentYearActualCost= this.safetyProductionCost.currentYearCost + this.safetyProductionCost.lastYearCarryCost;
                        }
                        break;
                    }
                    case 'currentYearCost':{
                        if(!reg.test(this.safetyProductionCost.currentYearCost)){
                            this.$message.error("本年度应提取的安全费用必须为数值!");
                            this.$refs.currentYearCost.focus();
                            this.safetyProductionCost.currentYearCost=this.safetyProductionCost.lastYearActualIncome*this.safetyProductionCost.org.orgCategory.safetyCostRatio/100;
                        }
                        break;
                    }
                    case 'lastYearCarryCost':{
                        if(!reg.test(this.safetyProductionCost.lastYearCarryCost)){
                            this.$message.error("上年度结转安全费用必须为数值!");
                            this.$refs.lastYearCarryCost.focus();
                            this.safetyProductionCost.lastYearCarryCost=0;
                        }else{
                            this.safetyProductionCost.currentYearActualCost= parseFloat(this.safetyProductionCost.currentYearCost) + parseFloat(this.safetyProductionCost.lastYearCarryCost);
                        }
                        break;
                    }
                    case 'currentYearActualCost':{
                        if(!reg.test(this.safetyProductionCost.currentYearActualCost)){
                            this.$message.error("本年度实际可用安全费用必须为数值!");
                            this.$refs.currentYearActualCost.focus();
                            this.safetyProductionCost.currentYearActualCost=0;
                        }
                        break;
                    }
                    case 'plan':{
                        if(!reg.test(this.safetyProductionCostPlans[index].planCost)){
                            this.$message.error("计划使用金额必须为数值!");
                            //this.$refs.plan+index.focus();
                            this.safetyProductionCostPlans[index].planCost=0;
                        }
                        break;
                    }
                }
            },
            saveUsePlan(){
                let plans = '';
                for(let i = 0;i<this.safetyProductionCostPlans.length;i++){
                    let plan = this.safetyProductionCostPlans[i];
                    plans += plan.id + ":" + plan.planCost;
                    if(i<this.safetyProductionCostPlans.length-1){
                        plans+=","
                    }
                }
                this.safetyProductionCost.plans=plans;
                this.$axios.post("/safetyProductionCost/safetyProductionCost",this.$qs.stringify(this.safetyProductionCost)).then(res=>{
                    if(res.data.result.resultCode==200){
                        this.$message.success("已保存!");
                        this.findPlan();
                    }
                }).catch(error=>console.log(error));
            },
            //显示或编辑安全生产费用使用计划
            usePlan(){
                this.usePlanVisible = true;
            },
            findPlan(){
                this.$axios.get("/safetyProductionCost/safetyProductionCost",{
                    params:{
                        year:this.year
                    }
                }).then(res =>{
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
                if(row.billingDate){
                    this.form.billingDate=getDate(new Date(row.billingDate));
                }
                this.editVisible = true;
                this.$refs["form"].clearValidate();
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.form.org=null;
                        this.form.safetyProductionCostPlan=null;
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
    .plan tr td{
        text-align: left;
        padding-left: 10px;
    }
    td input{
        border: none;
        font-size: 16px;
    }
</style>
