<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 安全会议管理
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
        <el-dialog title="编辑" :visible.sync="editVisible" width="30%"   @close="closeDialog">
            <el-form ref="form" :rules="rules" :model="form" label-width="90px">
                <el-form-item label="会议名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="开会时间" prop="meetingDate">
                    <el-date-picker
                            v-model="form.meetingDate"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="选择开会时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note"  maxlength="500" type="textarea" :rows="3"></el-input>
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
                <el-form-item label="会议名称" prop="name">
                    <el-input v-model="form.name" maxlength="50"
                              show-word-limit></el-input>
                </el-form-item>
                <el-form-item label="开会时间" prop="meetingDate">
                    <el-date-picker
                            v-model="form.meetingDate"
                            type="datetime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            placeholder="选择开会时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注">
                    <el-input v-model="form.note"  maxlength="500" type="textarea" :rows="3"></el-input>
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
        <!--显示会议内容-->
        <el-dialog title="" :visible.sync="showContentVisible" width="50%">
            <div id="printContent">
                <div style="height: 232mm;width:210mm;padding-top: 65mm;">
                    <div style="font-size: 30px;color:black;text-align: center;letter-spacing: 2mm;">安全生产会议记录</div>
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
                    <div  style="font-size: 18px;letter-spacing: 10px;text-align: center;width:100%;height:30%;">{{meeting.name}}</div>
                    <table style="width: 170mm;margin-left:20mm;margin-right:20mm;" cellspacing="0" cellpadding="0">
                        <tr>
                            <td colspan="6" style="border: none;">
                                <div style="float: right;margin-right: 10px;padding-bottom: 3px;">
                                    <label style="display: inline-block;border-bottom: black solid 1px;height:22px;width:50px;padding-bottom: 0px;">
                                        {{meeting.meetingDate | formatYear}}
                                    </label>
                                    <label>年</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                        {{meeting.meetingDate | formatMonth}}
                                    </div>
                                    <label>月</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:30px;height:22px;">
                                        {{meeting.meetingDate | formatDay}}
                                    </div>
                                    <label>日</label>
                                    <label style="margin-left:20px;">星期</label>
                                    <div style="display: inline-block;border-bottom: black solid 1px;width:50px;height:22px;">
                                        {{meeting.meetingDate | formatWeek}}
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 15%;">会议时间</td>
                            <td class="per20">
                                <table style="width:100%;" cellspacing="0" cellpadding="0">
                                    <tr>
                                        <!--<td>  {{meeting.meetingDate | formatHour}}点  {{meeting.meetingDate | formatMinute}} 分开会</td>-->
                                        <td>  {{meeting.meetingDate | formatMeetingTime}}开会</td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <el-time-select v-if="editable"
                                                            v-model="endMeetingDate"
                                                            :clearable="false"
                                                            size="mini"
                                                            :picker-options="{
                                                            start: '08:30',
                                                            step: '00:15',
                                                            end: '18:30'
                                                          }"
                                                            style="width: 100px;display: inline-block;margin-right: 3px;">
                                            </el-time-select>
                                            <div v-else style="display: inline-block;">{{meeting.endMeetingDate | formatMeetingTime}}</div>闭会</td>
                                    </tr>
                                </table>
                            </td>
                            <td style="width:10%">会议地点</td>
                            <td class="per25">
                                <input v-if="editable"  maxlength="200" v-model="meeting.meetingPlace"  />
                                <div v-else>{{meeting.meetingPlace}}</div>
                            </td>
                            <td style="width:10%">主持人</td>
                            <td class="per20">
                                <input v-if="editable"  maxlength="50" v-model="meeting.president"  />
                                <div v-else>{{meeting.president}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td style="width: 15%;">会议名称或主要议题</td>
                            <td colspan="3">
                                <input v-if="editable"  maxlength="100" v-model="meeting.meetingName" />
                                <div v-else>{{meeting.meetingName}}</div>
                            </td>
                            <td style="width:10%">记录人</td>
                            <td class="per20">
                                <input v-if="editable"  maxlength="50" v-model="meeting.recorder" />
                                <div v-else>{{meeting.recorder}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td>出席人</td>
                            <td colspan="5">
                                <input v-if="editable"  maxlength="500" v-model="meeting.attendants" />
                                <div v-else>{{meeting.attendants}}</div>
                            </td>
                        </tr>
                        <tr>
                            <td colspan="6">会议主要内容记录</td>
                        </tr>
                        <tr>
                            <td colspan="6">
                                <textarea v-if="editable"  maxlength="2000" v-model="meeting.content"  style="height:744mm;"></textarea>
                                <div v-else v-html="meeting.content" style="height:744mm;"></div>
                            </td>
                        </tr>
                    </table>
                    <div style="page-break-after: always;"></div>
                    <div style="width: 170mm;margin-left:20mm;margin-right:20mm;margin-top:20mm; text-align: center;border: 1px solid black;height:30px;line-height:30px;">
                        最后形成意见或决定</div>
                    <div style="width: 170mm;margin-left:20mm;margin-right:20mm;;text-align: center;border: 1px solid black;">
                        <textarea v-if="editable"  maxlength="2000" v-model="meeting.finalDecision" style="height:260mm;width:100%;"></textarea>
                        <div v-else v-html="meeting.finalDecision" style="height:260mm;"></div>
                    </div>
                </div>
                <div style="page-break-after: always;">&nbsp;</div>
                <div style="margin-top: 20mm;">
                    <table style="width: 170mm;margin-left:20mm;margin-right:20mm;" cellspacing="0" cellpadding="0">
                        <caption style="font-size: 18px;letter-spacing: 10px;">会议签到表</caption>
                        <tr>
                            <td colspan="4" style="border: none;text-align: left;">
                                会议名称：{{meeting.meetingName}}
                            </td>
                        </tr>
                        <tr>
                            <td colspan="4" style="border: none;text-align: left;">
                                会议时间：{{meeting.meetingDate | datetimeFormat}}
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
                <div style="width: 170mm;margin-left:20mm;margin-right:20mm;">
                    <div style="font-size: 18px;">
                        会议活动照片粘贴处:
                    </div>

                </div>
            </div>
            <span slot="footer" class="dialog-footer" style="position:fixed;bottom: 30px;left:45%;">
                <el-button v-if="!editable" type="primary" @click="editContent">编辑</el-button>
                <el-button v-if="!editable" type="warning" v-print="'#printContent'">打印</el-button>
                <el-button v-if="editable" type="primary" @click="saveContent">保存</el-button>
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
                <caption>{{template.name}}</caption>
                <tr>
                    <td colspan="4" style="border: none;">
                        <div style="float: right;margin-right: 10px;">{{template.meetingDate | formatDate}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议名称</td>
                    <td colspan="3">
                        <input v-if="editable" v-model="template.meetingName" placeholder="会议名称"/>
                        <div v-else>{{template.meetingName}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议时间</td>
                    <td class="per20" style="text-align: left;">
                        {{template.meetingDate | formatTime}}
                    </td>
                    <td class="per30">会议地点</td>
                    <td class="per20">
                        <input v-if="editable" v-model="template.meetingPlace" placeholder="会议地点" />
                        <div v-else>{{template.meetingPlace}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议主持人</td>
                    <td class="per20">
                        <input v-if="editable"  maxlength="50" v-model="template.president"  placeholder="主持人"/>
                        <div v-else>{{template.president}}</div>
                    </td>
                    <td class="per30">会议记录人</td>
                    <td class="per20">
                        <input v-if="editable"  maxlength="50" v-model="template.recorder" placeholder="记录人"/>
                        <div v-else>{{template.recorder}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">到场人员</td>
                    <td colspan="3">
                        <input v-if="editable"  maxlength="500" v-model="template.attendants" placeholder="到场人员"/>
                        <div v-else>{{template.attendants}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">到场人数</td>
                    <td class="per20">
                        <input v-if="editable" v-model="template.attendance" placeholder="到场人数"/>
                        <div v-else>{{template.attendance}}</div>
                    </td>
                    <td class="per30">缺席人数</td>
                    <td class="per20">
                        <input v-if="editable" v-model="template.absent" placeholder="缺席人数"/>
                        <div v-else>{{template.absent}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议主题</td>
                    <td colspan="3">
                        <input v-if="editable"  maxlength="100" v-model="template.theme" placeholder="会议主题" />
                        <div v-else>{{template.theme}}</div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">会议内容</td>
                    <td colspan="3">
                        <textarea v-if="editable"  maxlength="2000" v-model="template.content" rows="5" placeholder="会议内容"></textarea>
                        <div v-else v-html="template.content"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">需解决问题</td>
                    <td colspan="3">
                        <textarea v-if="editable"  maxlength="2000" v-model="template.problems" rows="5" placeholder="需解决问题"></textarea>
                        <div v-else v-html="template.problems"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">解决办法与工作安排</td>
                    <td colspan="3">
                        <textarea v-if="editable"  maxlength="2000" v-model="template.methods" rows="5" placeholder="解决办法和工作安排"></textarea>
                        <div v-else v-html="template.methods"></div>
                    </td>
                </tr>
                <tr>
                    <td class="per30">备注</td>
                    <td colspan="3">
                        <textarea v-if="editable"  maxlength="500" v-model="template.templateNote" rows="5" placeholder="备注"></textarea>
                        <div v-else v-html="template.templateNote"></div>
                    </td>
                </tr>
            </table>
            <span slot="footer" class="dialog-footer">
                <el-button  @click="showTemplateContentVisible=false">关闭</el-button>
            </span>
        </el-dialog>


       <!-- <div v-if="showContentVisible" style="position:absolute;left: 0;right:0;text-align: center; bottom:0;z-index: 9999;">
            <el-button v-if="!editable" type="primary" @click="editContent">编辑</el-button>
            <el-button v-if="!editable" type="warning" v-print="'#printContent'">打印</el-button>
            <el-button v-if="editable" type="primary" @click="saveContent">保存</el-button>
            <el-button  @click="showContentVisible=false">关闭</el-button>
        </div>-->
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
                templates: {
                    pageIndex: 1,
                    pageSize: 10,
                    pageTotal:0
                },
                showTemplateContentVisible:false,
                template:{},

                noteVisible:false,
                note:'',
                endMeetingDate:'',
                orgCategories:[],
                emps:[],
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
                meeting:{},
                form: {
                    area:[]
                },
                idx: -1,
                org:{},
                headers:{
                    token : localStorage.getItem("token")
                },
                param:{type:'meeting'},
                templatesData:[],
                templatesVisible:false,
                id: -1,
                rules:{
                    name: [
                        { required: true, message: '请输入名称', trigger: 'blur' }
                    ],
                    content:[
                        { required: true, message: '请输入文本内容', trigger: 'blur' }
                    ],
                    meetingDate:[
                        {
                            required:true,message:'请选择开会时间',trigger:'blur'
                        }
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
            formatMeetingTime(value){
                if(value) {
                    let date = new Date(value);
                    return date.getHours() + ":" +date.getMinutes();
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
            },
            datetimeFormat(value){
                if(value){
                    return getDateTime(new Date(value));
                }else{
                    return '';
                }
            },
            formatTime(value){
                if(value){
                    return getTime(new Date(value));
                }else{
                    return '';
                }
            }
        },
        created() {
            this.getData();
            this.uploadUrl = this.$baseURL + "/templateUpload";
            this.$axios.get("/employee/managementLayers").then(res=>{
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
            uploadTemplate(index,row){
                this.$refs.uploadFile.clearFiles();
                this.param.id=row.id;
                this.$refs.fileUploadBtn.$el.click();
            },
            downloadTemplate(index,row){
               // window.location.href=this.$baseURL + "/" + row.url;
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
            importTemplate(index,row){//引入模板
                this.template = row;
                this.$confirm('确定要引入该模板吗？', '提示', {
                    type: 'warning'
                })
                    .then(() => {
                        let formData = new FormData();
                        formData.append("templateId",row.id);
                        this.$axios.post("/meeting/template",formData)
                            .then(res=>{
                                this.getData();
                                this.templatesVisible=false;
                                this.showContentVisible = true;
                                this.editable=true;
                                this.meeting = res.data.data;
                            }).catch(error=>console.log(error));
                    })
                    .catch(() => {});
            },
            downloadTemplate(index,row){
               // window.location.href=this.$baseURL + "/" + row.url;
                window.open(this.$baseURL + "/" + row.url);
            },
            checkContent(index,row){//查看模板内容
                this.editable = false;
                this.showTemplateContentVisible = true;
                this.template = row;
            },
            //查找模板
            findTemplates(){
                this.$axios.get("/meetingTemplate/meetingTemplatesByPage",{
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
                if(this.meeting.endMeetingDate){
                    let date = new Date(this.meeting.endMeetingDate);
                    this.endMeetingDate =  date.getHours() + ":" +date.getMinutes();
                }
                if(this.meeting.content){
                    this.meeting.content = this.meeting.content.replace(/<br>/g,"\n");
                }
                if(this.meeting.problems){
                    this.meeting.problems = this.meeting.problems.replace(/<br>/g,"\n");
                }
                if(this.meeting.templateNote){
                    this.meeting.templateNote = this.meeting.templateNote.replace(/<br>/g,"\n");
                }
                if(this.meeting.methods){
                    this.meeting.methods = this.meeting.methods.replace(/<br>/g,"\n");
                }
            },
            saveContent(){
                if(this.meeting.content){
                    this.meeting.content = this.meeting.content.replace(/\n/g,"<br>");
                }
                if(this.meeting.problems){
                    this.meeting.problems = this.meeting.problems.replace(/\n/g,"<br>");
                }
                if(this.meeting.templateNote){
                    this.meeting.templateNote = this.meeting.templateNote.replace(/\n/g,"<br>");
                }
                if(this.meeting.methods){
                    this.meeting.methods = this.meeting.methods.replace(/\n/g,"<br>");
                }

                this.meeting.endMeetingDate = this.endMeetingDate;
                this.$axios.post("/meeting/content", this.$qs.stringify(this.meeting)).then(res => {
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
                this.meeting=row;
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
            timeFormatter(row, column, cellValue, index){
                if(cellValue){
                    return getTime(new Date(cellValue));
                }else{
                    return '';
                }
            },
            closeDialog(){
                this.$refs["form"].clearValidate();
            },
            // 获取 easy-mock 的模拟数据
            getData() {
                this.$axios.get("/meeting/meetingsByPage",{
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
                        this.$axios.delete("/meeting/meeting/" + row.id).then(res => {
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

                if(row.meetingDate){
                    this.form.meetingDate=getDateTime(new Date(row.meetingDate));
                }
            },
            // 保存编辑
            saveEdit() {
                this.$refs.form.validate(validate => {
                    if (validate) {
                        this.$axios.post("/meeting/updateMeeting" , this.$qs.stringify(this.form)).then(res => {
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
                        this.form.type='meeting';
                        this.$axios.post("/meeting/meeting",this.$qs.stringify(this.form)).then(res=>{
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
    .customeIcon{
        width:0px;
        margin-left:-20px;
    }
</style>

