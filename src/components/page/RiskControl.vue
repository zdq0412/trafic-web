<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover" style="height:500px;">
                    <div slot="header" class="clearfix">
                        <span style="font-weight: bold;">危险源辨识与控制</span>
                    </div>
                    <div slot="header"  style="margin-top:20px;">
                        <span>危险源辨识方法：R（风险值）＝L（可能性）×S（严重性）</span>
                    </div>
                    <div style="width:100%;text-align: center;margin-top:-15px;margin-bottom:5px;">
                        <span>安全风险等级判定准则（R）及控制措施</span>
                    </div>
                    <el-table
                            :data="tableData"
                            border
                            style="width: 100%"
                            :cell-style="cellStyle">
                        <el-table-column
                                prop="col0"
                                label="风险值"
                        >
                        </el-table-column>
                        <el-table-column
                                prop="col1"
                                label="风险等级"
                        >
                        </el-table-column>
                        <el-table-column
                                prop="col2"
                                label="应采取的行动/控制措施"
                                width="190">
                        </el-table-column>
                        <el-table-column
                                prop="col3"
                                label="实施期限"
                        >
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover" style="height:500px;">
                    <div slot="header" class="clearfix">
                        <span style="font-weight: bold;">危险源辨识与控制</span>
                    </div>
                    <div slot="header"  style="margin-top:20px;">
                        <span>厂区安全风险空间分布四色图</span>
                        <el-button style="float: right; padding: 3px 0px"
                                   type="text" @click="helpDialog=true">查看帮助</el-button>

                        <el-dialog title="帮助" :visible.sync="helpDialog" width="30%">
                            <el-card shadow="hover" style="height:500px;">
                                <div slot="header" class="clearfix">
                                    <span style="font-weight: bold;">帮助</span>
                                    <el-button style="float: right; padding: 3px 10px" type="text"
                                               @click="download">下载到本地</el-button>
                                </div>
                            </el-card>
                            <span slot="footer" class="dialog-footer">
                                <el-button @click="helpDialog = false">确定</el-button>
                            </span>
                        </el-dialog>
                        <el-upload
                                style="display: none;"
                                :action="uploadUrl"
                                :limit="1"
                                :auto-upload="true"
                                accept=".jpeg,.png,.bmp,.jpg,.JPEG,.PNG,.BMP,.JPG"
                                :on-success="handleAvatarSuccess"
                                :before-upload="beforeAvatarUpload"
                                :headers="headers"
                        >
                            <el-button size="small" ref="fileUploadBtn" slot="trigger" type="primary">点击上传</el-button>
                        </el-upload>
                        <el-button style="float: right; padding: 3px 10px" type="text"
                                   @click="handleUpload">上传</el-button>
                    </div>
                    <img alt="厂区安全风险空间分布四色图"
                         style="width:100%;height:400px;margin-top: -10px;"
                         :src="fourColorPic"/>
                </el-card>
            </el-col>
        </el-row>
        <el-row :gutter="20">
            <el-col :span="24">
                <el-card shadow="hover" style="height:403px;">
                    <div slot="header" class="clearfix">
                        <span>待办事项</span>
                        <el-button style="float: right; padding: 3px 0" type="text">添加</el-button>
                    </div>
                    <el-table :show-header="false" :data="todoList" style="width:100%;">
                        <el-table-column width="40">
                            <template slot-scope="scope">
                                <el-checkbox v-model="scope.row.status"></el-checkbox>
                            </template>
                        </el-table-column>
                        <el-table-column>
                            <template slot-scope="scope">
                                <div
                                        class="todo-item"
                                        :class="{'todo-item-del': scope.row.status}"
                                >{{scope.row.title}}</div>
                            </template>
                        </el-table-column>
                        <el-table-column width="60">
                            <template>
                                <i class="el-icon-edit"></i>
                                <i class="el-icon-delete"></i>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
    import bus from '../common/bus';
    export default {
        name: 'dashboard',
        data() {
            return {
                helpDialog:false,
                fourColorPic:'',
                uploadUrl:'',
                headers:{
                    token : localStorage.getItem("token")
                },
                tableData: [{
                    col0: '20-25',
                    col1: '重大风险',
                    col2: '在采取措施降低风险前，不能继续作业，对改进措施进行评估',
                    col3: '立刻'
                }
                    ,{
                        col0: '15-16',
                        col1: '较大风险',
                        col2: '采取紧急措施降低风险，建立运行控制程序，定期检查、测量及评估',
                        col3: '立即或近期整改'
                    }
                    ,{
                        col0: '9-12',
                        col1: '一般风险',
                        col2: '可考虑建立目标、建立操作规程，加强培训及沟通',
                        col3: '2年内治理'
                    }
                    ,{
                        col0: '4-8',
                        col1: '低风险',
                        col2: '可考虑建立操作规程、作业指导书但需定期检查',
                        col3: '有条件、有经费时治理'
                    }
                    ,{
                        col0: '1-3',
                        col1: '低风险',
                        col2: '无需采用控制措施',
                        col3: '需保存记录'
                    }
                ],
                name: localStorage.getItem('ms_username'),
                todoList: [
                    {
                        title: '今天要修复100个bug',
                        status: false
                    },
                    {
                        title: '今天要修复100个bug',
                        status: false
                    },
                    {
                        title: '今天要写100行代码加几个bug吧',
                        status: false
                    },
                    {
                        title: '今天要修复100个bug',
                        status: false
                    },
                    {
                        title: '今天要修复100个bug',
                        status: true
                    },
                    {
                        title: '今天要写100行代码加几个bug吧',
                        status: true
                    }
                ],
                data: [
                    {
                        name: '2018/09/04',
                        value: 1083
                    },
                    {
                        name: '2018/09/05',
                        value: 941
                    },
                    {
                        name: '2018/09/06',
                        value: 1139
                    },
                    {
                        name: '2018/09/07',
                        value: 816
                    },
                    {
                        name: '2018/09/08',
                        value: 327
                    },
                    {
                        name: '2018/09/09',
                        value: 228
                    },
                    {
                        name: '2018/09/10',
                        value: 1065
                    }
                ],
                options: {
                    type: 'bar',
                    title: {
                        text: '最近一周各品类销售图'
                    },
                    xRorate: 25,
                    labels: ['周一', '周二', '周三', '周四', '周五'],
                    datasets: [
                        {
                            label: '家电',
                            data: [234, 278, 270, 190, 230]
                        },
                        {
                            label: '百货',
                            data: [164, 178, 190, 135, 160]
                        },
                        {
                            label: '食品',
                            data: [144, 198, 150, 235, 120]
                        }
                    ]
                },
                options2: {
                    type: 'line',
                    title: {
                        text: '最近几个月各品类销售趋势图'
                    },
                    labels: ['6月', '7月', '8月', '9月', '10月'],
                    datasets: [
                        {
                            label: '家电',
                            data: [234, 278, 270, 190, 230]
                        },
                        {
                            label: '百货',
                            data: [164, 178, 150, 135, 160]
                        },
                        {
                            label: '食品',
                            data: [74, 118, 200, 235, 90]
                        }
                    ]
                }
            };
        },
        components: {
        },
        computed: {
            role() {
                return this.name === 'admin' ? '超级管理员' : '普通用户';
            }
        },
        created(){
            this.uploadUrl = this.$baseURL + "/org/upload4ColorPic";
            this.loadFourColorPic();
        },
        methods: {
            loadFourColorPic(){
                this.$axios.get("/org/fourColorPic").then(res =>{
                    if(res.data.result.resultCode==200){
                        this.fourColorPic=this.$baseURL + "/" + res.data.data;
                    }
                }).catch(error=>{
                    console.log(error);
                })
            },
            handleAvatarSuccess(res, file) {
                this.loadFourColorPic();
            },
            beforeAvatarUpload(file) {
                const isLt2M = file.size / 1024 / 1024 < 2;
                const isJPG = file.type === 'image/jpeg';
                const isGIF = file.type === 'image/gif';
                const isPNG = file.type === 'image/png';
                const isBMP = file.type === 'image/bmp';

                if (!isJPG && !isGIF && !isPNG && !isBMP) {
                    this.$message.error('上传图片必须是JPG/GIF/PNG/BMP 格式!');
                }
                if (!isLt2M) {
                    this.$message.error('上传图片大小不能超过 2MB!');
                }
                return isJPG && isLt2M;
            },
            // cellStyle(row, column, rowIndex, columnIndex){
            cellStyle(obj){
                if(obj.rowIndex==0 && obj.columnIndex==0){
                    return 'backgroundColor:red';
                }
                if(obj.rowIndex==1 && obj.columnIndex==0){
                    return 'backgroundColor:#E6A23C';
                }
                if(obj.rowIndex==2 && obj.columnIndex==0){
                    return 'backgroundColor:yellow';
                }
                if(obj.rowIndex==3 && obj.columnIndex==0){
                    return 'backgroundColor:#6699CC';
                }
                if(obj.rowIndex==4 && obj.columnIndex==0){
                    return 'backgroundColor:#6699CC';
                }
            },
            changeDate() {
                const now = new Date().getTime();
                this.data.forEach((item, index) => {
                    const date = new Date(now - (6 - index) * 86400000);
                    item.name = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
                });
            },
            handleUpload(){
                this.$refs.fileUploadBtn.$el.click();
            },
            download(){
                window.location.href=this.$baseURL + "/category.xlsx"
            }
        }
    };
</script>


<style scoped>
    .el-row {
        margin-bottom: 20px;
    }

    .grid-content {
        display: flex;
        align-items: center;
        height: 100px;
    }

    .grid-cont-right {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #999;
    }

    .grid-num {
        font-size: 30px;
        font-weight: bold;
    }

    .grid-con-icon {
        font-size: 50px;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
        color: #fff;
    }

    .grid-con-1 .grid-con-icon {
        background: rgb(45, 140, 240);
    }

    .grid-con-1 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-2 .grid-con-icon {
        background: rgb(100, 213, 114);
    }

    .grid-con-2 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-3 .grid-con-icon {
        background: rgb(242, 94, 67);
    }

    .grid-con-3 .grid-num {
        color: rgb(242, 94, 67);
    }

    .user-info {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 2px solid #ccc;
        margin-bottom: 20px;
    }

    .user-avator {
        width: 120px;
        height: 120px;
        border-radius: 50%;
    }

    .user-info-cont {
        padding-left: 50px;
        flex: 1;
        font-size: 14px;
        color: #999;
    }

    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }

    .user-info-list {
        font-size: 14px;
        color: #999;
        line-height: 25px;
    }

    .user-info-list span {
        margin-left: 70px;
    }

    .mgb20 {
        margin-bottom: 20px;
    }

    .todo-item {
        font-size: 14px;
    }
</style>
