// type UserRole = 'owner'|'manager'|'guest'|'notLogin';
// enum OperatePermissionEnum{ //动作
//   DeleteRole='delete.role'
// }


// interface IDeleteRoleProps{
//   userRole:UserRole;
//   userId:string;
//   userName?:string;
// }

// interface IDeleteRoleResult{
//     success:boolean;
//     errormessage:string;
// }

// /**
//  * useDelete
//  * 提供标准的删除用户的权限功能，只有管理员、项目Owner 有权限删除，未登录 或者 访客无权限执行
//  */
// const useDeleteRole=({userRole,userId,userName}:IDeleteRoleProps):IDeleteRoleResult=>{
//   if(!userRole){
//     return{
//       success:false,
//       errormessage:'未获取到用户身份'
//     }
//   }

//   const hasDeletePermission=useRolePermission(
//     {
//       userRole,
//       permissionCode:OperatePermissionEnum.DeleteRole
//     })
// }