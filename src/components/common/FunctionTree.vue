<template>
    <el-tree
            :props="props"
            :load="loadNode"
            lazy
            show-checkbox
            @check-change="handleCheckChange">
    </el-tree>
</template>
<script>
    export default {
        data() {
            return {
                props: {
                    label: 'name',
                    children: 'zones'
                },
                count: 1
            };
        },
        methods: {
            handleCheckChange(data, checked, indeterminate) {
                console.log(data, checked, indeterminate);
            },
            handleNodeClick(data) {
                console.log(data);
            },
            loadNode(node, resolve) {
                if (node.level === 0) {
                    return resolve([{ name: '用户管理' }, { name: '角色管理' }]);
                }
                if (node.level > 3) return resolve([]);

                var hasChild;
                if (node.data.name === '用户管理') {
                    hasChild = true;
                } else if (node.data.name === '角色管理') {
                    hasChild = false;
                } else {
                    hasChild = Math.random() > 0.5;
                }

                setTimeout(() => {
                    var data;
                    if (hasChild) {
                        data = [{
                            name: '添加用户'
                        }, {
                            name: '修改用户'
                        }];
                    } else {
                        data = [{
                            name: '添加角色'
                        }, {
                            name: '修改角色'
                        }];
                    }

                    resolve(data);
                }, 500);
            }
        }
    };
</script>

<style scoped>

</style>