<template>
    <el-tree
            :data="functions"
            show-checkbox
            node-key="id"
            ref="tree"
            :default-checked-keys="functionIds"
            :props="defaultProps">
    </el-tree>
</template>
<script>
    export default {
        props:['paramType','param'],
        data() {
            return {
                functions:[],
                functionIds:[],
                defaultProps: {
                    children: 'children',
                    label: 'name'
                }
            };
        },
        mounted(){
            this.getData();
        },
        methods:{
            getCheckedKeys(){
                return this.$refs.tree.getCheckedKeys();
            },
            getData(){
                let url = '';
                let params = {};
                switch (this.paramType) {
                    case 'role':{
                        url = 'functions/roleFunctions';
                        params={roleId:this.param};
                        break;
                    }
                    case 'directory':{
                        url='functions/directoryFunctions';
                        params={dirId:this.param};
                        break;
                    }
                    case 'orgCategory':{
                        url='functions/orgCategoryFunctions';
                        params={orgCategoryId:this.param};
                        break;
                    }
                }
                this.$axios.get(url,{
                    params:params
                }).then(res =>{
                    this.functions=res.data.functions;
                    this.functionIds = res.data.functionIds;
                }).catch(error => {
                    console.log(error);
                })
            }
        }
    };
</script>

<style scoped>

</style>