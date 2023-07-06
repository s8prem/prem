import { AccountUtils, CommonNoUIUtils, EnvUtils, CommonWfmNoUIUtils, FeatureToggleUtils } from 'cxone-playwright-test-utils';
import { AutomaticApprovalRulesComponentPage } from '../pageobjects/automatic-approval-rules-component.page';
import { FEATURE_TOGGLES } from '../../../src/app/shared/enums/constants';
import { _ } from 'lodash';

const orgName = 'orghttp' + AccountUtils.getRandomString() + AccountUtils.getFullRandomString(5);

const adminUser: any = {
  email: AccountUtils.getRandomEmail(5),
  password: AccountUtils.getAlphaNumericWithSpecialCharacters(12),
  firstName: 'F_Admin',
  lastName: 'L_Admin',
  orgName: orgName,
  token: null
};

const employeeEmailAddress = 'ptor.' + (new Date().getTime()) + '@wfosaas.com';
const employeePassword = AccountUtils.getAlphaNumericWithSpecialCharacters(12);
const userValues: any = {
  firstName: 'User_fName',
  lastName: 'User_lName',
  role: null,
  assignedGroup: undefined
};
const emptySuValues = { name: 'SU_with_no_users', timeZone: 'Asia/Jerusalem' };
const suValues_1: any = {
  name: AccountUtils.getRandomString('AA_SU_'),
  timeZone: 'Asia/Jerusalem',
  firstWeekDay: 'MONDAY',
  id: '',
  isDefault: true,
  workingHours: null
};

const accountSetup = async () => {
  const tenantDetailsEmail = adminUser.email;
  const tenantDetailsPassword = adminUser.password;
  const tenantDetailsOrgName = orgName;
  await AccountUtils.createTenant({
    email: tenantDetailsEmail,
    userName: tenantDetailsEmail,
    password: tenantDetailsPassword,
    organizationName: tenantDetailsOrgName,
    licenses: ['WFM', 'QM', 'RECORDING']
  });
  return { email: tenantDetailsEmail, password: tenantDetailsPassword, userName: tenantDetailsEmail, orgName: tenantDetailsOrgName };
};

const globalSetup = async () => {
  const tenantAccount = await accountSetup();
  //EnvUtils to send data to a test
  console.log('login', adminUser.email, adminUser.password);
  adminUser.token = await CommonNoUIUtils.login(adminUser.email, adminUser.password, false);
  await FeatureToggleUtils.addTenantToFeature(FEATURE_TOGGLES.AUTOMATIC_APPROVAL, adminUser.orgName, adminUser.token);
  await FeatureToggleUtils.removeTenantFromFeature(FEATURE_TOGGLES.SCHEDULE_RULES_BE, adminUser.orgName, adminUser.token);
  await FeatureToggleUtils.removeTenantFromFeature(FEATURE_TOGGLES.SCHEDULE_RULES_FE, adminUser.orgName, adminUser.token);
  const roleName = await AutomaticApprovalRulesComponentPage.createRole(adminUser.token);
  userValues.role = roleName;
  console.log('new role name: ', roleName);
  await CommonWfmNoUIUtils.addOrUpdateScheduleUnit(emptySuValues, adminUser.token);
  const response = await CommonWfmNoUIUtils.addOrUpdateScheduleUnit(suValues_1, adminUser.token);
  console.log('new schedule unit id: ', response.groupId);
  suValues_1.id = response.groupId;
  userValues.assignedGroup = response.groupId;
  console.log('Create and activate user');
  await AccountUtils.registerAndActivateUser(employeeEmailAddress, employeePassword, userValues, adminUser.email, adminUser.orgName, adminUser.token);
  EnvUtils.setCustom('adminUser', adminUser);
  EnvUtils.setCustom('userValues', userValues);
  EnvUtils.setCustom('employeeEmailAddress', employeeEmailAddress);
  EnvUtils.setCustom('employeePassword', employeePassword);
  EnvUtils.setCustom('suValues_1', suValues_1);
};
export default globalSetup;
