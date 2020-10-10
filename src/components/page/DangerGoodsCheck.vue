<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 危险货物自查
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
                <el-date-picker
                        v-model="form.checkDateFrom"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="检查时间开始">
                </el-date-picker>
                -
                <el-date-picker
                        v-model="form.checkDateTo"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="检查时间截止">
                </el-date-picker>

                <el-button
                        style="margin-left:10px;"
                        type="primary"
                        icon="el-icon-search"
                        class="handle-del mr10"
                        @click="searchRecord"
                >搜索</el-button>

                <el-button
                        type="warning"
                        icon="el-icon-printer"
                        class="handle-del mr10"
                       @click="showPrintDialog"
                >打印</el-button>

                <el-button
                        type="success"
                        icon="el-icon-s-data"
                        class="handle-del mr10"
                        @click="analysisVisible=true"
                >治理分析表</el-button>

                <el-button
                        type="success"
                        icon="el-icon-s-data"
                        class="handle-del mr10"
                        @click="statisticsVisible=true"
                >类型统计表</el-button>

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
                <el-table-column prop="checkDate" label="检查时间" :formatter="dateFormatter">
                </el-table-column>
                <el-table-column prop="checkedOrg" label="被检单位名称" width="120"></el-table-column>
                <el-table-column prop="hiddenDanger" label="存在的安全隐患" width="120"></el-table-column>
                <el-table-column prop="correctiveAction" label="整改措施"></el-table-column>
                <el-table-column prop="timelimit" label="整改时限"></el-table-column>
                <el-table-column prop="person" label="责任人"></el-table-column>
                <el-table-column prop="endTime" label="整改到位时间" :formatter="dateFormatter" width="120"></el-table-column>
                <el-table-column prop="cancelDate" label="销号时间" :formatter="dateFormatter" width="100"></el-table-column>
                <el-table-column prop="rectification" label="是否已整改" width="100">
                    <template slot-scope="scope">
                        <span v-if="!scope.row.rectification">否</span>
                        <span v-else>是</span>
                    </template>
                </el-table-column>
                <el-table-column prop="rectificationFund" label="整改金额（元）" width="120"></el-table-column>
                <el-table-column prop="severity.name" label="隐患严重程度" width="120"></el-table-column>
                <el-table-column prop="reasonCategory.name" label="隐患原因类别" width="120"></el-table-column>
                <el-table-column prop="detailNote" label="备注" width="120"></el-table-column>
                <el-table-column label="操作" width="180" align="center"  fixed="right">
                    <template slot-scope="scope">
                        <!-- <el-upload style="display: none;"
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
                         >下载文件</el-button>-->
                        <el-button v-if="!scope.row.rectification"
                                   type="text"
                                   icon="el-icon-s-operation"
                                   class="download"
                                   @click="rectificationFun(scope.$index, scope.row)"
                        >整改</el-button>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="50%"  @close="closeDialog('editForm')" @open="loadSelectData">
            <el-form ref="editForm" :rules="rules" :model="editableForm" label-width="120px">
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="检查时间" prop="checkDate">
                            <el-date-picker
                                    v-model="editableForm.checkDate"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="选择检查时间">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="被检单位名称">
                    <el-input v-model="editableForm.checkedOrg" maxlength="100"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="存在的安全隐患">
                    <el-input v-model="editableForm.hiddenDanger" maxlength="500" type="textarea" ></el-input>
                </el-form-item>
                <el-form-item label="整改措施">
                    <el-input v-model="editableForm.correctiveAction" maxlength="500" type="textarea" ></el-input>
                </el-form-item>
                <el-form-item label="整改时限">
                    <el-input v-model="editableForm.timelimit" maxlength="200"></el-input>
                </el-form-item>
                <el-form-item label="责任人">
                    <el-input v-model="editableForm.person" maxlength="50"></el-input>
                </el-form-item>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="整改到位时间">
                            <el-date-picker
                                    v-model="editableForm.endTime"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="请选择时间">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="销号时间">
                            <el-date-picker
                                    v-model="editableForm.cancelDate"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="请选择时间">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="隐患严重程度" prop="severityId">
                    <el-select   v-model="editableForm.severityId" placeholder="请选择">
                        <el-option
                                v-for="item in severitys"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select >
                </el-form-item>
                <el-form-item label="隐患原因类别" prop="reasonCategoryId">
                    <el-select   v-model="editableForm.reasonCategoryId" placeholder="请选择">
                        <el-option
                                v-for="item in reasonCategorys"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select >
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="editableForm.detailNote" maxlength="500" type="textarea" ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false;editableForm=JSON.parse(JSON.stringify(form))">取 消</el-button>
                <el-button type="primary" @click="saveEdit">确 定</el-button>
            </span>
        </el-dialog>
        <!-- 新增弹出框 -->
        <el-dialog title="新增" :visible.sync="addVisible" width="50%"  @close="closeDialog('form')" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="120px">
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="检查时间" prop="checkDate">
                            <el-date-picker
                                    v-model="form.checkDate"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="选择检查时间">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="被检单位名称">
                    <el-input v-model="form.checkedOrg" maxlength="100"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="存在的安全隐患">
                    <el-input v-model="form.hiddenDanger" maxlength="500" type="textarea" ></el-input>
                </el-form-item>
                <el-form-item label="整改措施">
                    <el-input v-model="form.correctiveAction" maxlength="500" type="textarea" ></el-input>
                </el-form-item>
                <el-form-item label="整改时限">
                    <el-input v-model="form.timelimit" maxlength="200"></el-input>
                </el-form-item>
                <el-form-item label="责任人">
                    <el-input v-model="form.person" maxlength="50"></el-input>
                </el-form-item>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="整改到位时间">
                            <el-date-picker
                                    v-model="form.endTime"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="请选择时间">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="销号时间">
                            <el-date-picker
                                    v-model="form.cancelDate"
                                    type="date"
                                    value-format="yyyy-MM-dd"
                                    placeholder="请选择时间">
                            </el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="隐患严重程度" prop="severityId">
                    <el-select   v-model="form.severityId" placeholder="请选择">
                        <el-option
                                v-for="item in severitys"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select >
                </el-form-item>
                <el-form-item label="隐患原因类别" prop="reasonCategoryId">
                    <el-select   v-model="form.reasonCategoryId" placeholder="请选择">
                        <el-option
                                v-for="item in reasonCategorys"
                                :key="item.id"
                                :label="item.name"
                                :value="item.id">
                        </el-option>
                    </el-select >
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.detailNote" maxlength="500" type="textarea" ></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="cancelAdd()">取 消</el-button>
                <el-button type="primary" @click="saveAdd">确 定</el-button>
            </span>
        </el-dialog>
        <!--整改-->
        <el-dialog title="整改" :visible.sync="rectificationVisible" width="50%"  @close="closeDialog('form')" @open="loadSelectData">
            <el-form ref="form" :rules="rules" :model="form" label-width="120px">
                <el-form-item label="整改金额（元）" prop="rectificationFund">
                    <el-input-number v-model="form.rectificationFund" maxlength="10"></el-input-number>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="rectificationVisible=false">取 消</el-button>
                <el-button type="primary" @click="saveRectification">确 定</el-button>
            </span>
        </el-dialog>
        <!--隐患排查和治理情况分析表-->
        <el-dialog title="治理情况分析表" :visible.sync="analysisVisible" width="50%"   @open="analysis">
            <el-form>
                <div class="handle-box">
                    <el-form-item label="日期" label-width="60">
                        <el-date-picker
                                v-model="checkDateFrom"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="检查日期开始">
                        </el-date-picker>
                        -
                        <el-date-picker
                                v-model="checkDateTo"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="检查日期截止">
                        </el-date-picker>
                        <el-button style="margin-left:10px;"
                                   type="primary"
                                   icon="el-icon-search"
                                   class="handle-del mr10"
                                   @click="analysis"
                        >查找</el-button>
                    </el-form-item>
                </div>
                <div id="print_analysis" style="padding-left:10px;padding-right: 10px;">
                    <table style="width: 100%;" cellspacing="0" cellpadding="0">
                        <caption style="font-size: 20px;">隐患排查和治理情况分析表</caption>
                        <tr>
                            <td colspan="5" style="border: none;text-align: left;" >
                                <div style="display: inline-block;">统计人:{{employee.name}}</div>
                                <div v-if="!checkDateFrom && !checkDateTo" style="float: right;display: inline-block;">统计时间段:全部</div>
                                <div v-else style="float: right;display: inline-block;">统计时间段:{{checkDateFrom}}~{{checkDateTo}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>隐患排查数(项)</td>
                            <td>已整改数（项）</td>
                            <td>整改率（%）</td>
                            <td>整改投入资金（元）</td>
                        </tr>
                        <tr v-for="record in analysisRecord">
                            <td>{{record[0]}}</td>
                            <td>{{record[1]}}</td>
                            <td>{{record[2]}}</td>
                            <td>{{record[3] | twoPoint}}</td>
                            <td>{{record[4]}}</td>
                        </tr>
                    </table>
                </div>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button v-print="print_analysis" type="warning">打 印</el-button>
                <el-button @click="analysisVisible=false">关 闭</el-button>
                <div style="color:red;margin-top:5px;font-size:12px;">如需打印功能请使用火狐或谷歌浏览器!</div>
            </span>
        </el-dialog>
        <!--隐患类型统计表-->
        <el-dialog title="隐患类型统计表" :visible.sync="statisticsVisible" width="50%"   @open="statistics">
            <el-form>
                <div class="handle-box">
                    <el-form-item label="日期" label-width="60">
                        <el-date-picker
                                v-model="checkDateFrom"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="检查日期开始">
                        </el-date-picker>
                        -
                        <el-date-picker
                                v-model="checkDateTo"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="检查日期截止">
                        </el-date-picker>
                        <el-button style="margin-left:10px;"
                                   type="primary"
                                   icon="el-icon-search"
                                   class="handle-del mr10"
                                   @click="statistics"
                        >查找</el-button>
                    </el-form-item>
                </div>
                <div id="print_statistics" style="padding-left:10px;padding-right: 10px;">
                    <table style="width: 100%;" cellspacing="0" cellpadding="0">
                        <caption style="font-size: 20px;">隐患类型统计表</caption>
                        <tr>
                            <td colspan="5" style="border: none;text-align: left;">
                                <div style="display: inline-block;">统计人:{{employee.name}}</div>
                                <div v-if="!checkDateFrom && !checkDateTo" style="float: right;display: inline-block;">统计时间段:全部</div>
                                <div v-else style="float: right;display: inline-block;">统计时间段:{{checkDateFrom}}-{{checkDateTo}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td></td>
                            <td>隐患排查数(项)</td>
                            <td>已整改数（项）</td>
                            <td>整改率（%）</td>
                            <td>整改投入资金（元）</td>
                        </tr>
                        <tr v-for="record in statisticsRecord">
                            <td>{{record[0]}}</td>
                            <td>{{record[1]}}</td>
                            <td>{{record[2]}}</td>
                            <td>{{record[3] | twoPoint}}</td>
                            <td>{{record[4]}}</td>
                        </tr>
                    </table>
                </div>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button  v-print="print_statistics" type="warning">打 印</el-button>
                <el-button @click="statisticsVisible=false">关 闭</el-button>
                <div style="color:red;margin-top:5px;font-size:12px;">如需打印功能请使用火狐或谷歌浏览器!</div>
            </span>
        </el-dialog>
        <!--显示打印内容-->
        <el-dialog title="打印" :visible.sync="showPrintVisible" width="70%">
            <div id="printContent">
                <div style="font-size: 18px;letter-spacing: 10px;text-align: center;width:100%;margin-bottom:10px;">危险货物运输企业安全生产隐患排查整改台账</div>
                <table style="width: 100%;" cellspacing="0" cellpadding="0">
                    <thead>
                    <tr>
                        <th style="width:5%;">检查时间</th>
                        <th style="width:8%;">被检单位名称</th>
                        <th style="width:15%;">存在的安全隐患</th>
                        <th style="width:15%;">整改措施</th>
                        <th style="width:5%;">整改时限</th>
                        <th style="width:5%;">责任人</th>
                        <th style="width:10%;">整改到位时间</th>
                        <th style="width:5%;">销号时间</th>
                        <th style="width:5%;">是否已整改</th>
                        <th style="width:5%;">整改金额(元)</th>
                        <th style="width:5%;">隐患严重程度</th>
                        <th style="width:5%;">隐患原因类别</th>
                        <th style="width:12%;">备注</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="detail in details">
                        <td>
                        <span>
                            {{detail.checkDate | formatDate}}
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.checkedOrg}}
                        </span>
                        </td>
                        <td style="text-align: left;padding-left:3px;">
                        <span  v-html="detail.hiddenDanger" >
                        </span>
                        </td>
                        <td>
                        <span  v-html="detail.correctiveAction">
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.timelimit}}
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.person}}
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.endTime | formatDate}}
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.cancelDate | formatDate}}
                        </span>
                        </td>
                        <td>
                        <span v-if="!detail.rectification">
                            否
                        </span>
                        <span v-else>
                            是
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.rectificationFund}}
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.severity.name}}
                        </span>
                        </td>
                        <td>
                        <span>
                            {{detail.reasonCategory.name}}
                        </span>
                        </td>
                        <td>
                        <span v-html="detail.detailNote">
                        </span>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="13" style="border: none;text-align: left;">
                            <span>企业负责人签字：</span> <div style="width:200px;display: inline-block;">&nbsp;</div>
                            <span>安全检查组人员签字：</span>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
            <span slot="footer" class="dialog-footer">
                 <el-button type="warning" v-print="printObj">打印</el-button>
                <el-button  @click="showPrintVisible=false">关闭</el-button>
                <div style="color:red;margin-top:5px;font-size:12px;">如需打印功能请使用火狐或谷歌浏览器!</div>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import  {getDate} from "../common/utils";
    export default {
        name: 'basetable',
        data() {
            return {
                printObj:{
                    id:'printContent'
                },
                print_analysis:{
                    id:'print_analysis'
                },
                print_statistics:{
                    id:'print_statistics'
                },
                query: {
                    pageIndex: 1,
                    pageSize: 10
                },
                severityId:'',
                employee:{},
                reasonCategoryId:'',
                severitys:[],
                reasonCategorys:[],
                rectificationVisible:false,
                tableData: [],
                showPrintVisible:false,
                editVisible: false,
                addVisible: false,
                pageTotal: 0,
                haveOrg:false,
                checkDateFrom:'',
                analysisRecord:[],
                statisticsRecord:[],
                checkDateTo:'',
                details:[],
                statisticsVisible:false,//类型统计
                analysisVisible:false,//治理分析
                form: {},
                editableForm: {},
                idx: -1,
                id: -1,
                rules:{
                    checkDate: [
                        { required: true, message: '请选择检查日期', trigger: 'blur' }
                    ],
                    severityId:[
                        { required: true, message: '请选择隐患严重程度', trigger: ['blur','change'] }
                    ],
                    reasonCategoryId:[
                        { required: true, message: '请选择隐患原因类别', trigger: ['blur','change'] }
                    ],
                    rectificationFund:[
                        {
                            required:true,message:'请输入整改金额',trigger:'blur'
                        }
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
            },
            twoPoint(value){
                if(value){
                    return parseFloat(value).toFixed(2);
                }else{
                    return 0;
                }
            }
        },
        created() {
            this.getData();
            this.$axios.get("/employee/currentEmployee").then(res =>{
                this.employee = res.data.data;
            }).catch(error=>console.log(error));
        },
        methods: {
            showPrintDialog(){
                this.$axios.get("/dangerGoodsCheckDetailRecord/dangerGoodsCheckDetailRecords",{
                    params:{
                        checkDateFrom:this.form.checkDateFrom,
                        checkDateTo:this.form.checkDateTo,
                        page:this.query.pageIndex,
                        limit:this.query.pageSize
                    }
                }).then(res => {
                    this.details = res.data.data;
                    this.showPrintVisible=true;
                }).catch(error => {
                    console.log(error);
                });
            },
            //统计
            statistics(){
                this.$axios.get("/dangerGoodsCheckDetailRecord/statistics",{
                    params:{
                        checkDateFrom:this.checkDateFrom,
                        checkDateTo:this.checkDateTo
                    }
                }).then(res=>{
                    this.statisticsRecord = res.data;
                    //a:隐患排查总数 b:整改数总数 c: 整改数  d:整改投入总资金
                    let a = 0,b=0,c=0,d=0;
                    for(let i = 0;i<this.statisticsRecord.length;i++){
                        let record = this.statisticsRecord[i];
                        a+=record[1];
                        b+=record[2];
                        c+=record[1]*record[3]/100;
                        d+=record[4];
                    }
                    let ratio = c/a*100;
                    if(isNaN(ratio)){
                        ratio=0;
                    }else{
                        ratio=ratio.toFixed(2);
                    }
                    this.statisticsRecord.push(['全部',a,b,ratio,d]);
                }).catch(error=>console.log(error));
            },
            //分析
            analysis(){
                this.$axios.get("/dangerGoodsCheckDetailRecord/analysis",{
                    params:{
                        checkDateFrom:this.checkDateFrom,
                        checkDateTo:this.checkDateTo
                    }
                }).then(res=>{
                    this.analysisRecord = res.data;
                    //a:隐患排查总数 b:整改数总数 c: 整改数  d:整改投入总资金
                    let a = 0,b=0,c=0,d=0;
                    for(let i = 0;i<this.analysisRecord.length;i++){
                        let record = this.analysisRecord[i];
                        a+=record[1];
                        b+=record[2];
                        c+=record[1]*record[3]/100;
                        d+=record[4];
                    }
                    let ratio = c/a*100;
                    if(isNaN(ratio)){
                        ratio=0;
                    }else{
                        ratio=ratio.toFixed(2);
                    }
                    this.analysisRecord.push(['全部',a,b,ratio,d]);
                }).catch(error=>console.log(error));
            },
            saveRectification(){
                this.$axios.get("/dangerGoodsCheckDetailRecord/rectificate",{
                    params:{
                        id:this.form.id,
                        rectificationFund:this.form.rectificationFund
                    }
                }).then(res =>{
                    this.rectificationVisible = false;
                    this.$message.success("已整改!");
                    this.getData();
                }).catch(error=>console.log(error));
            },
            rectificationFun(index,row){
                this.$confirm('确定要整改吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.form = row;
                        this.rectificationVisible = true;
                    })
                    .catch(() => {});
            },
            loadSelectData(){
                this.$axios.get("/category/categorys",{
                    params:{
                        type:'隐患排查严重程度'
                    }
                }).then(res => {
                    this.severitys = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
                this.$axios.get("/category/categorys",{
                    params:{
                        type:'隐患排查原因类别'
                    }
                }).then(res => {
                    this.reasonCategorys = res.data.data;
                }).catch(error => {
                    console.log(error);
                });
            },
            handleAdd(){
                this.form = {};
                this.addVisible = true;
                if(this.$refs.form){
                    this.$refs.form.clearValidate();
                }
            },
            dateFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getDate(new Date(cellValue));
                }else{
                    return '';
                }
            },
            closeDialog(form){
                this.$refs[form].clearValidate();
            },
            searchRecord(){
                this.getData();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/dangerGoodsCheckDetailRecord/dangerGoodsCheckDetailRecordsByPage",{
                    params:{
                        checkDateFrom:this.form.checkDateFrom,
                        checkDateTo:this.form.checkDateTo,
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
                // 二次确认删除
                this.$confirm('确定要删除吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        this.$axios.delete("/dangerGoodsCheckDetailRecord/dangerGoodsCheckDetailRecord/" + row.id).then(res => {
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
                    this.form.checkDate = getDate(new Date(row.checkDate));
                    this.editableForm.checkDate = getDate(new Date(row.checkDate));
                }
                if(row.cancelDate){
                    this.form.cancelDate = getDate(new Date(row.cancelDate));
                    this.editableForm.cancelDate = getDate(new Date(row.cancelDate));
                }
                if(row.endTime){
                    this.form.endTime = getDate(new Date(row.endTime));
                    this.editableForm.endTime = getDate(new Date(row.endTime));
                }
                if(row.severity){
                    this.form.severityId = row.severity.id;
                    this.editableForm.severityId = row.severity.id;
                }
                if(row.reasonCategory){
                    this.form.reasonCategoryId = row.reasonCategory.id;
                    this.editableForm.reasonCategoryId = row.reasonCategory.id;
                }
            },
            // 保存编辑
            saveEdit() {
                this.form=JSON.parse(JSON.stringify(this.editableForm));
                this.$refs.editForm.validate(validate => {
                    if (validate) {
                        this.form.content='';
                        this.$axios.post("/dangerGoodsCheckDetailRecord/updateDangerGoodsCheckDetailRecord" , this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/dangerGoodsCheckDetailRecord/dangerGoodsCheckDetailRecord",this.$qs.stringify(this.form)).then(res=>{
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

    table {
        width: 100%;
        font-size: 12px;
    }
    .red {
        color: #ff0000;
    }
    .mr10 {
        margin-right: 10px;
    }

    tr td,tr th{
        border: black solid 1px;
        text-align: center;
        height:30px;
        line-height: 30px;
    }

    td div{
        text-align: left;
        padding-left: 5px;
    }
</style>
