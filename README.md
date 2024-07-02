#Admin Panel Modules. More could be added in future

1.superadmin
2.admin
3.doctor
4.staff
5.appointment
6.notification
7.patient
8.event
9.master vaccine template
10.doctor vaccine template

#Pramod Sir asked to change permissions module so that permissions should be set for specific user, not user role

#I have made changes in the register API. So that whenever a user gets registered, a set of default permissions for all the present modules would be generated for that user.
#Changed the permission module. Starting to use user id instead of user role id
#updated the permissions table schema in the DB
#Updated all the functions wherever permissions are involved.