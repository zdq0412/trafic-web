<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 培训管理
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
                <el-table-column prop="creator" label="创建人"></el-table-column>
                <el-table-column prop="trainingDate" label="开会时间" :formatter="datetimeFormatter"></el-table-column>
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%"  @open="loadSelectData" @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="培训时间" prop="trainingDate">
                            <el-date-picker
                                    v-model="form.trainingDate"
                                    type="datetime"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="选择培训时间">
                            </el-date-picker>
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
        <el-dialog title="新增" :visible.sync="addVisible" width="30%"   @close="closeDialog" >
            <el-form ref="form" :rules="rules" :model="form" label-width="90px">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-row type="flex" class="row-bg" >
                    <el-col >
                        <el-form-item label="培训时间" prop="trainingDate">
                            <el-date-picker
                                    v-model="form.trainingDate"
                                    type="datetime"
                                    value-format="yyyy-MM-dd HH:mm:ss"
                                    placeholder="选择培训时间">
                            </el-date-picker>
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
        <!--显示培训内容-->
        <el-dialog title="培训内容" :visible.sync="showContentVisible" width="50%">
            <div id="printContent">
                <div style="height: 232mm;width:210mm;padding-top: 65mm;">
                    <div style="font-size: 30px;color:black;text-align: center;letter-spacing: 2mm;">企业安全学习及培训教育记录</div>
                    <div style="margin-top:60mm;font-size: 25px;color:black;text-align: center;letter-spacing: 2mm;">
                        <label>企业名称:</label>
                        <div style="border-bottom: black solid 1px;width: 130mm;display: inline-block;">
                            {{org.name}}
                        </div>
                    </div>
                    <div style="margin-top:20mm;font-size: 25px;color:black;text-align: center;letter-spacing: 2mm;">
                        <label>地&nbsp;&nbsp;&nbsp;&nbsp;址:</label>
                        <div style="border-bottom: black solid 1px;width: 130mm;display: inline-block;">
                            {{org.addr}}
                        </div>
                    </div>
                </div>
                <div>
                    <div style="font-size: 18px;letter-spacing: 10px;text-align: center;width:100%;">{{training.name}}</div>
                    <table style="width: 170mm;margin-left:20mm;margin-right:20mm;   " cellspacing="0" cellpadding="0">
                        <tr>
                            <td colspan="6" style="border: none;">
                                <div style="float: right;margin-right: 10px;padding-bottom: 3px;">
                                    <label style="display: inline-block;border-bottom: black solid 1px;height:22px;width:50px;padding-bottom: 0px;">
                                        {{training.trainingDate | formatYear}}
                                    </label>
                                    <label>年</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                        {{training.trainingDate | formatMonth}}
                                    </div>
                                    <label>月</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                        {{training.trainingDate | formatDay}}
                                    </div>
                                    <label>日</label>
                                    <label style="margin-left:20px;">星期</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:50px;height:22px;">
                                        {{training.trainingDate | formatWeek}}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>活动名称</td>
                            <td colspan="3">
                                <input v-if="editable" v-model="training.trainingName"  />
                                <div v-else>{{training.trainingName}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td>参加对象</td>
                            <td colspan="3">
                                <input v-if="editable" v-model="training.attendants" />
                                <div v-else>{{training.attendants}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-space: 30px;">地点</td>
                            <td>
                                <input v-if="editable" v-model="training.trainingPlace" />
                                <div v-else>{{training.trainingPlace}}</div>
                            </td>
                            <td style="text-space: 30px;">主讲人</td>
                            <td>
                                <input v-if="editable" v-model="training.president" />
                                <div v-else>{{training.president}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td>参加人数</td>
                            <td style="text-align: left;">
                                <span>应到:</span>
                                <input v-if="editable" v-model="training.attendance" style="width:50px;"/>
                                <span v-else>{{training.attendance}}</span>
                                <span>实到:</span>
                                <input v-if="editable" v-model="training.realAttendance" style="width:50px;"/>
                                <span v-else>{{training.realAttendance}}</span>
                            </td>
                            <td style="text-space: 30px;">记录人</td>
                            <td style="width:250px;">
                                <input v-if="editable" v-model="training.recorder" />
                                <div v-else>{{training.recorder}}</div>
                            </td>
                        </tr>
                        <tr style="border-bottom: none;">
                            <td colspan="4" style="text-align: left; border-bottom: none;" >
                                安全学习及教育培训活动内容和反馈意见（可粘附活动照片）：
                            </td>
                        </tr>
                        <tr>
                            <td colspan="4">
                                <textarea v-if="editable" v-model="training.content" style="height:744mm;" ></textarea>
                                <div v-else v-html="training.content" style="height:744mm;"></div>
                            </td>
                        </tr>
                    </table>
                </div>
                <div style="page-break-after: always;"></div>
                <div style="width:100%;">
                    <table style="width: 170mm;margin-left:20mm;margin-right:20mm;margin-top:20mm;" cellspacing="0" cellpadding="0">
                        <tr>
                            <td colspan="6" style="height:20mm;">
                                <table style="width: 100%;">
                                    <tr>
                                        <td style="text-align: center;border: none;letter-spacing: 10px;">
                                            参加活动的人员名单
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center;border: none;">
                                            <label style="display: inline-block;border-bottom: black solid 1px;height:22px;width:50px;padding-bottom: 0px;">
                                            </label>
                                            <label>年</label>
                                            <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                            </div>
                                            <label>月</label>
                                            <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                            </div>
                                            <label>日</label>
                                            <label style="margin-left:20px;">星期</label>
                                            <div style="display: inline-block;border-bottom: black solid 1px;width:50px;height:22px;">
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 120px;">姓名</td>
                            <td>单位(部门)</td>
                            <td>职务</td>
                            <td style="width: 100px;">联系电话</td>
                            <td style="width: 150px;">签到</td>
                        </tr>
                        <tr v-for="emp in emps" >
                            <td>{{emp.name}}</td>
                            <td>{{emp.department.name}}</td>
                            <td>{{emp.position.name}}</td>
                            <td>{{emp.tel}}</td>
                            <td></td>
                        </tr>
                        <tr v-for="i in 15">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </table>
                </div>
                <div style="page-break-after: always;"></div>
                <div>
                    <div style="font-size: 18px;letter-spacing: 10px;text-align: center;width:100%;margin-top:20mm;">补课签到表</div>
                    <table style="width: 170mm;margin-left:20mm;margin-right:20mm;" cellspacing="0" cellpadding="0">
                        <tr>
                            <td colspan="6" style="border: none;">
                                <div style="float: right;margin-right: 10px;padding-bottom: 3px;">
                                    <label style="display: inline-block;border-bottom: black solid 1px;height:22px;width:50px;padding-bottom: 0px;">
                                    </label>
                                    <label>年</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                    </div>
                                    <label>月</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                    </div>
                                    <label>日</label>
                                    <label style="margin-left:20px;">星期</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:50px;height:22px;">
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>活动名称</td>
                            <td colspan="5">
                            </td>
                        </tr>
                        <tr>
                            <td>参加对象</td>
                            <td colspan="5">
                            </td>
                        </tr>
                        <tr>
                            <td style="text-space: 30px;">地点</td>
                            <td colspan="2">
                            </td>
                            <td style="text-space: 30px;">主讲人</td>
                            <td colspan="2">
                            </td>
                        </tr>
                        <tr>
                            <td>参加人数</td>
                            <td style="text-align: left;" colspan="2">
                                <span>应到:</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                <span>实到:</span>
                            </td>
                            <td style="text-space: 30px;">记录人</td>
                            <td colspan="2">
                            </td>
                        </tr>
                        <tr>
                            <td colspan="6">
                                参加补课的人员名单
                            </td>
                        </tr>
                        <tr>
                            <td>姓名(签名)</td>
                            <td>备注(岗位)</td>
                            <td>成绩</td>
                            <td>姓名(签名)</td>
                            <td>备注(岗位)</td>
                            <td>成绩</td>
                        </tr>
                        <tr v-for="i in 15">
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </table>
                </div>
            </div>
            <span slot="footer" class="dialog-footer"  style="position:fixed;bottom: 30px;left:45%;">
                <el-button v-if="!editable" type="primary" @click="editContent">编辑</el-button>
                <el-button v-if="!editable" type="warning" v-print="printObj">打印</el-button>
                <el-button v-else type="primary" @click="saveContent">保存</el-button>
                <el-button  @click="showContentVisible=false">关闭</el-button>
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
        <!--模板内容-->
        <el-dialog title="模板内容" :visible.sync="showTemplateContentVisible" width="60%">
            <table style="width: 100%;" cellspacing="0" cellpadding="0">
                <caption>{{training.name}}</caption>
                <tr>
                    <td colspan="4" style="border: none;">
                        <div style="float: right;margin-right: 10px;">会议日期</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议名称</td>
                    <td colspan="3">
                        <input v-if="editable" v-model="training.trainingName" placeholder="会议名称"/>
                        <div v-else>{{training.trainingName}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议时间</td>
                    <td class="per20">

                    </td>
                    <td class="per30">会议地点</td>
                    <td class="per20">
                        <input v-if="editable" v-model="training.trainingPlace" placeholder="会议地点" />
                        <div v-else>{{training.trainingPlace}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议主持人</td>
                    <td class="per20">
                        <input v-if="editable" v-model="training.president"  placeholder="主持人"/>
                        <div v-else>{{training.president}}</div>
                    </td>
                    <td class="per30">会议记录人</td>
                    <td class="per20">
                        <input v-if="editable" v-model="training.recorder" placeholder="记录人"/>
                        <div v-else>{{training.recorder}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">到场人员</td>
                    <td colspan="3">
                        <input v-if="editable" v-model="training.attendants" placeholder="到场人员"/>
                        <div v-else>{{training.attendants}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">到场人数</td>
                    <td class="per20">
                        <input v-if="editable" v-model="training.attendance" placeholder="到场人数"/>
                        <div v-else>{{training.attendance}}</div>
                    </td>
                    <td class="per30">缺席人数</td>
                    <td class="per20">
                        <input v-if="editable" v-model="training.absent" placeholder="缺席人数"/>
                        <div v-else>{{training.absent}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议主题</td>
                    <td colspan="3">
                        <input v-if="editable" v-model="training.theme" placeholder="会议主题" />
                        <div v-else>{{training.theme}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议内容</td>
                    <td colspan="3">
                        <textarea v-if="editable" v-model="training.content" rows="5" placeholder="会议内容"></textarea>
                        <div v-else v-html="training.content"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">需解决问题</td>
                    <td colspan="3">
                        <textarea v-if="editable" v-model="training.problems" rows="5" placeholder="需解决问题"></textarea>
                        <div v-else v-html="training.problems"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">解决办法与工作安排</td>
                    <td colspan="3">
                        <textarea v-if="editable" v-model="training.methods" rows="5" placeholder="解决办法和工作安排"></textarea>
                        <div v-else v-html="training.methods"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">备注</td>
                    <td colspan="3">
                        <textarea v-if="editable" v-model="training.templateNote" rows="5" placeholder="备注"></textarea>
                        <div v-else v-html="training.templateNote"></div>
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="showTemplateContentVisible=false">关闭</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
    import  {getDate,getDateTime,getTime} from "../common/utils";
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
                param:{type:'training'},
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


                noteVisible:false,
                note:'',
                emps:[],
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
                training:{},
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
            formatHour(value){
                if(value) {
                    return new Date(value).getHours();
                }else{
                    return '';
                }
            },
            formatMinute(value){
                if(value) {
                    return new Date(value).getMinutes();
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
            this.$axios.get("/employee/employees").then(res=>{
                this.emps = res.data.data;
            }).catch(error=>console.log(error));
            this.$axios.get("/user/haveOrg").then(res =>{
                if(res.data.data){
                    this.haveOrg = true;
                    this.org = res.data.data;
                }
            }).catch(error=>console.log(error));
        },
        methods: {
            importTemplate(index,row){//引入模板
                this.template = row;
                this.$confirm('确定要引入该模板吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        let formData = new FormData();
                        formData.append("templateId",row.id);
                        this.$axios.post("/training/template",formData)
                            .then(res=>{
                                this.getData();
                                this.templatesVisible=false;
                                this.showContentVisible = true;
                                this.editable=true;
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
                window.location.href=this.$baseURL + "/" + row.url;
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
                    this.$message.error('只能上传work文档!');
                    return false;
                }
                return  true;
            },
            //查找模板
            findTemplates(){
                this.$axios.get("/trainingTemplate/trainingTemplatesByPage",{
                    params:{
                        page:this.templates.pageIndex,
                        limit:this.templates.pageSize,
                        type:"training"
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
                if(this.training.content){
                    this.training.content = this.training.content.replace(/<br>/g,"\n");
                }
                if(this.training.problems){
                    this.training.problems = this.training.problems.replace(/<br>/g,"\n");
                }
                if(this.training.templateNote){
                    this.training.templateNote = this.training.templateNote.replace(/<br>/g,"\n");
                }
                if(this.training.methods){
                    this.training.methods = this.training.methods.replace(/<br>/g,"\n");
                }
            },
            saveContent(){
                if(this.training.content){
                    this.training.content = this.training.content.replace(/\n/g,"<br>");
                }
                if(this.training.problems){
                    this.training.problems = this.training.problems.replace(/\n/g,"<br>");
                }
                if(this.training.templateNote){
                    this.training.templateNote = this.training.templateNote.replace(/\n/g,"<br>");
                }
                if(this.training.methods){
                    this.training.methods = this.training.methods.replace(/\n/g,"<br>");
                }
                this.$axios.post("/training/content", this.$qs.stringify(this.training)).then(res => {
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
                this.training=row;
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
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/training/trainingsByPage",{
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
                        this.$axios.delete("/training/training/" + row.id).then(res => {
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
                        this.$axios.put("/training/training?" + this.$qs.stringify(this.form)).then(res => {
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
                        this.$axios.post("/training/training",this.$qs.stringify(this.form)).then(res=>{
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
