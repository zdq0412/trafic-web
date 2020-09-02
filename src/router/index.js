import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);
const originalPush = Router.prototype.push;
Router.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err)
};
export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/console'
        },
        {
            path: '/',
            component: () => import('../components/common/Home.vue'),
            meta: { title: '' },
            children: [
                {
                    path: '/console',
                    component: () => import( '../components/page/Console.vue'),
                    meta: { title: '系统首页' }
                },
                {
                  path:'/employee',
                  component:()=>import('../components/page/Employee.vue'),
                  meta:{title:'企业人员资料'}
                },
                {
                  path:'/emergencyPlanBak',
                  component:()=>import('../components/page/EmergencyPlanBak.vue'),
                  meta:{title:'应急预案备案'}
                },
                {
                  path:'/securityExaminationTemplate',
                  component:()=>import('../components/page/SecurityExaminationTemplate.vue'),
                  meta:{title:'责任考核模板'}
                },
                {
                  path:'/empArchivesTemplate',
                  component:()=>import('../components/page/EmpArchivesTemplate.vue'),
                  meta:{title:'人员档案模板'}
                },
                {
                  path:'/deviceArchivesTemplate',
                  component:()=>import('../components/page/DeviceArchivesTemplate.vue'),
                  meta:{title:'设备档案模板'}
                },
                {
                  path:'/securityExamination',
                  component:()=>import('../components/page/SecurityExamination.vue'),
                  meta:{title:'责任考核'}
                },
                {
                  path:'/goalExaminationTemplate',
                  component:()=>import('../components/page/GoalExaminationTemplate.vue'),
                  meta:{title:'安全目标考核模板'}
                },
                {
                  path:'/goalExamination',
                  component:()=>import('../components/page/GoalExamination.vue'),
                  meta:{title:'安全目标考核'}
                },
                {
                  path:'/emergencyPlanDrillTemplate',
                  component:()=>import('../components/page/EmergencyPlanDrillTemplate.vue'),
                  meta:{title:'应急预案演练模板'}
                },
                {
                  path:'/emergencyPlanDrill',
                  component:()=>import('../components/page/EmergencyPlanDrill.vue'),
                  meta:{title:'应急预案演练'}
                },
                {
                  path:'/healthyRecordTemplate',
                  component:()=>import('../components/page/HealthyRecordTemplate.vue'),
                  meta:{title:'职业健康记录模板'}
                },
                {
                  path:'/healthyRecord',
                  component:()=>import('../components/page/HealthyRecord.vue'),
                  meta:{title:'职业健康记录'}
                },
                {
                  path:'/standardizationTemplate',
                  component:()=>import('../components/page/StandardizationTemplate.vue'),
                  meta:{title:'标准化自评模板'}
                },
                {
                  path:'/standardization',
                  component:()=>import('../components/page/Standardization.vue'),
                  meta:{title:'标准化自评'}
                },
                {
                  path:'/empArchives',
                  component:()=>import('../components/page/EmpArchives.vue'),
                  meta:{title:'人员档案'}
                },
                {
                  path:'/deviceArchives',
                  component:()=>import('../components/page/DeviceArchives.vue'),
                  meta:{title:'设备档案'}
                },
                {
                  path:'/safetyAccount',
                  component:()=>import('../components/page/SafetyAccount.vue'),
                  meta:{title:'安全投入台账'}
                },
                {
                  path:'/GPSAccount',
                  component:()=>import('../components/page/GPSAccount.vue'),
                  meta:{title:'GPS监控台账'}
                },
                {
                  path:'/rulesTemplate',
                  component:()=>import('../components/page/RuleTemplate.vue'),
                  meta:{title:'安全规章制度'}
                },
                {
                  path:'/securityCheckTemplate',
                  component:()=>import('../components/page/SecurityCheckTemplate.vue'),
                  meta:{title:'安全检查模板'}
                },
                {
                  path:'/securityCheck',
                  component:()=>import('../components/page/SecurityCheck.vue'),
                  meta:{title:'安全检查管理'}
                },
                {
                  path:'/deviceCheckTemplate',
                  component:()=>import('../components/page/DeviceCheckTemplate.vue'),
                  meta:{title:'设备点检模板'}
                },
                {
                  path:'/tankVehicleTemplate',
                  component:()=>import('../components/page/TankVehicleTemplate.vue'),
                  meta:{title:'罐式车辆检查模板'}
                },
                {
                  path:'/dangerGoodsCheckTemplate',
                  component:()=>import('../components/page/DangerGoodsCheckTemplate.vue'),
                  meta:{title:'模板'}
                },
                {
                  path:'/tankVehicle',
                  component:()=>import('../components/page/TankVehicle.vue'),
                  meta:{title:'罐式车辆检查'}
                },
                {
                  path:'/dangerGoodsCheck',
                  component:()=>import('../components/page/DangerGoodsCheck.vue'),
                  meta:{title:'危险货物自查'}
                },
                {
                  path:'/riskCheckTemplate',
                  component:()=>import('../components/page/RiskCheckTemplate.vue'),
                  meta:{title:'风险排查模板'}
                },
                {
                  path:'/meetingTemplate',
                  component:()=>import('../components/page/MeetingTemplate.vue'),
                  meta:{title:'会议模板'}
                },
                {
                  path:'/meeting',
                  component:()=>import('../components/page/Meeting.vue'),
                  meta:{title:'会议管理'}
                },
                {
                  path:'/trainingTemplate',
                  component:()=>import('../components/page/TrainingTemplate.vue'),
                  meta:{title:'培训模板'}
                },
                {
                  path:'/training',
                  component:()=>import('../components/page/Training.vue'),
                  meta:{title:'培训管理'}
                },
                {
                  path:'/responsibilityTemplate',
                  component:()=>import('../components/page/ResponsibilityTemplate.vue'),
                  meta:{title:'责任书模板'}
                },
                {
                  path:'/examination',
                  component:()=>import('../components/page/Responsibility.vue'),
                  meta:{title:'责任制'}
                },
                {
                  path:'/deviceCheck',
                  component:()=>import('../components/page/DeviceCheck.vue'),
                  meta:{title:'设备点检'}
                },
                {
                  path:'/securityBuild',
                  component:()=>import('../components/page/SecurityBuild.vue'),
                  meta:{title:'安全文化建设'}
                },
                {
                  path:'/securityMonth',
                  component:()=>import('../components/page/SecurityMonth.vue'),
                  meta:{title:'安全生产月'}
                },
                {
                  path:'/securityActivity',
                  component:()=>import('../components/page/SecurityActivity.vue'),
                  meta:{title:'各种安全活动'}
                },
                {
                  path:'/accidentRecord',
                  component:()=>import('../components/page/AccidentRecord.vue'),
                  meta:{title:'事故记录及处理'}
                },
                {
                  path:'/fourRecord',
                  component:()=>import('../components/page/FourRecord.vue'),
                  meta:{title:'四不放过记录'}
                },
                {
                  path:'/jobManagementAccount',
                  component:()=>import('../components/page/JobManagementAccount.vue'),
                  meta:{title:'作业管理台账'}
                },
                {
                  path:'/jobManagementAccountTemplate',
                  component:()=>import('../components/page/JobManagementAccountTemplate.vue'),
                  meta:{title:'作业管理台账模板'}
                },
               {
                  path:'/law',
                  component:()=>import('../components/page/Law.vue'),
                  meta:{title:'法律法规政策'}
                },
                {
                  path:'/rules',
                  component:()=>import('../components/page/Rules.vue'),
                  meta:{title:'安全规章制度'}
                },
                {
                  path:'/notification',
                  component:()=>import('../components/page/Notification.vue'),
                  meta:{title:'企业发文通知'}
                },
                {
                  path:'/riskControl',
                  component:()=>import('../components/page/RiskControl.vue'),
                  meta:{title:'风险辨识管控'}
                },
                {
                  path:'/introduction',
                  component:()=>import('../components/page/Introduction.vue'),
                  meta:{title:'企业简要介绍'}
                },
                {
                  path:'/structure',
                  component:()=>import('../components/page/Structure.vue'),
                  meta:{title:'管理组织架构'}
                },
                {
                    path: '/function',
                    component: () => import( '../components/page/Function.vue'),
                    meta: { title: '权限管理' }
                },
                {
                    path: '/directory',
                    component: () => import( '../components/page/Directory.vue'),
                    meta: { title: '目录管理' }
                },
                {
                    path: '/user',
                    component: () => import( '../components/page/User.vue'),
                    meta: { title: '用户管理' }
                },
                {
                    path: '/areaManager',
                    component: () => import( '../components/page/AreaManager.vue'),
                    meta: { title: '区域管理员' }
                },
                {
                    path: '/role',
                    component: () => import( '../components/page/Role.vue'),
                    meta: { title: '角色管理' }
                },
                {
                    // 富文本编辑器组件
                    path: '/org',
                    component: () => import('../components/page/Org.vue'),
                    meta: { title: '企业管理' }
                },
                {
                    // markdown组件
                    path: '/category',
                    component: () => import('../components/page/Category.vue'),
                    meta: { title: '数据字典管理' }
                },
                {
                    // 图片上传组件
                    path: '/org_category',
                    component: () => import('../components/page/OrgCategory.vue'),
                    meta: { title: '企业类别管理' }
                },
                {
                    // vue-schart组件
                    path: '/schema',
                    component: () => import( '../components/page/Schema.vue'),
                    meta: { title: '模式管理' }
                },
                {
                    path: '/404',
                    component: () => import('../components/page/404.vue'),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: () => import('../components/page/403.vue'),
                    meta: { title: '403' }
                },
                {
                    path: '/resume',
                    name:'resume',
                    component: () => import( '../components/page/Resume.vue'),
                    meta: { title: '人员简历' }
                },
                {
                    path: '/preplanDrillRecord',
                    name:'preplanDrillRecord',
                    component: () => import( '../components/page/PreplanDrillRecord.vue'),
                    meta: { title: '应急预案演练' }
                },
                {
                    path: '/idcard',
                    name:'idcard',
                    component: () => import( '../components/page/IDCard.vue'),
                    meta: { title: '人员身份证' }
                },
                {
                    path: '/contract',
                    name:'contract',
                    component: () => import( '../components/page/Contract.vue'),
                    meta: { title: '劳动合同' }
                },
                {
                    path: '/qualificationDocument',
                    name:'qualificationDocument',
                    component: () => import( '../components/page/QualificationDocument.vue'),
                    meta: { title: '资质文件' }
                },
                {
                    path: '/jobHistory',
                    name:'jobHistory',
                    component: () => import( '../components/page/JobHistory.vue'),
                    meta: { title: '从业经历' }
                },
                {
                    path: '/inductionTraining',
                    name:'inductionTraining',
                    component: () => import( '../components/page/InductionTraining.vue'),
                    meta: { title: '入职培训' }
                },
                {
                    path: '/safetyResponsibilityAgreement',
                    name:'safetyResponsibilityAgreement',
                    component: () => import( '../components/page/SafetyResponsibilityAgreement.vue'),
                    meta: { title: '安全责任书' }
                },
                {
                    path: '/trainingExamine',
                    name:'trainingExamine',
                    component: () => import( '../components/page/TrainingExamine.vue'),
                    meta: { title: '培训考核情况' }
                },
                {
                    path: '/otherDocument',
                    name:'otherDocument',
                    component: () => import( '../components/page/OtherDocument.vue'),
                    meta: { title: '其他档案' }
                },
                {
                    path: '/deviceMaintain',
                    name:'deviceMaintain',
                    component: () => import( '../components/page/DeviceMaintain.vue'),
                    meta: { title: '设备保养维修检修' }
                }
            ]
        },
        {
            path: '/login',
            component: () => import( '../components/page/Login.vue'),
            meta: { title: '交通安全信息系统' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
