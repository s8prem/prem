import { Page, test, expect } from '@playwright/test';
import { EnvUtils, PageObjects, CommonUIUtils, CommonWfmNoUIUtils, AccountUtils } from 'cxone-playwright-test-utils';
import { MySchedulePage } from '../pageobjects/my-schedule.page';
import { AutomaticApprovalRulesComponentPage } from '../pageobjects/automatic-approval-rules-component.page';
import { TimeRestrictionTypes } from '../../../src/app/shared/enums/time-restriction-types';
import { Days } from '../../../src/app/shared/enums/days';

const adminUser: any = EnvUtils.getCustom('adminUser');
const suValues_1: any = EnvUtils.getCustom('suValues_1');
const employeeEmailAddress: any = EnvUtils.getCustom('employeeEmailAddress');
const employeePassword: any = EnvUtils.getCustom('employeePassword');
let testUserToken: any;
const activeStatus = 'Active';
const inactiveStatus = 'Inactive';
const ruleName = 'test-rule name';
const ruleName2 = 'test-rule name-2';
let activityCode: any;

const login = async (page, username, password) => {
  const loginPage = new PageObjects.LoginPage(page);
  await loginPage.open();
  console.log('Login to application using ' + username + '-----' + password);
  const loginResponse = await loginPage.login(username, password);
  return loginResponse;
};

const columnIds = {
  NAME: 'ruleName',
  SCHEDULING_UNITS: 'schedulingUnits',
  ACTIVITY_CODES: 'activityCodes',
  STATUS: 'status',
  ACTIONS: 'actions'
};

const columnNames = {
  ruleName: 'Name',
  schedulingUnits: 'Scheduling Units',
  activityCodes: 'Activity codes',
  status: 'Status'
};

test.describe.serial('Automatic Approval Rules Protractor Tests', () => {
  let page: Page;
  let mySchedulePage: MySchedulePage;
  let automaticApprovalRulesComponentPage: AutomaticApprovalRulesComponentPage;

  test.beforeAll(async ({ browser }) => {
    console.log('Prerequisite Setup stared');
    page = await browser.newPage();
    await page.setViewportSize({ width: 1350, height: 600 });
    // login to the new created test user
    testUserToken = await login(page, await employeeEmailAddress,await employeePassword);
    await CommonUIUtils.waitUntilIconLoaderDone(page);
    console.log('Login to test user account Successfully...');
    mySchedulePage = new MySchedulePage(page);
    automaticApprovalRulesComponentPage = new AutomaticApprovalRulesComponentPage(page);
    await automaticApprovalRulesComponentPage.navigateTo();
    await CommonUIUtils.waitUntilIconLoaderDone(page);
    console.log('Prerequisite Setup Ended ::');
  });

  test.describe.serial('Automatic Approval Rules - General Tests', () => {
    test('should navigate to Auto-Approval Page successfully', async () => {
      console.log('wait for Auto Approval Grid...');
      await automaticApprovalRulesComponentPage.waitForGrid();
      const isAutomaticApprovalRulesPageWrapperPresent = await automaticApprovalRulesComponentPage.wrapperIsPresent();
      console.log('rules grid page is present: ', isAutomaticApprovalRulesPageWrapperPresent);
      expect(isAutomaticApprovalRulesPageWrapperPresent).toBeTruthy();
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      expect(await automaticApprovalRulesComponentPage.getGridRowCount()).toEqual(0);
      expect(await automaticApprovalRulesComponentPage.isNewRuleButtonIsPresent()).toBeTruthy();
    });
    test('should validate Grid UI successfully', async () => {
      const colNameLabel = await automaticApprovalRulesComponentPage.getColumnHeaderLabelById(columnIds.NAME);
      expect(colNameLabel).toEqual(columnNames[columnIds.NAME]);
      const colSULabel = await automaticApprovalRulesComponentPage.getColumnHeaderLabelById(columnIds.SCHEDULING_UNITS);
      expect(colSULabel).toEqual(columnNames[columnIds.SCHEDULING_UNITS]);
      const colACLabel = await automaticApprovalRulesComponentPage.getColumnHeaderLabelById(columnIds.ACTIVITY_CODES);
      expect(colACLabel).toEqual(columnNames[columnIds.ACTIVITY_CODES]);
      const colStatusLabel = await automaticApprovalRulesComponentPage.getColumnHeaderLabelById(columnIds.STATUS);
      expect(colStatusLabel).toEqual(columnNames[columnIds.STATUS]);
      const countLabel = await automaticApprovalRulesComponentPage.getOmnibarCountItemsLabel();
      expect(countLabel.trim()).toEqual('0 rules');
    });
  });

  test.describe.serial('Grid API', () => {
    test.beforeAll(async () => {
      console.log('On Start - Grid API');
      const activityCodes = await CommonWfmNoUIUtils.getActivityCodes(await adminUser.token);
      console.log('activityCodes', await activityCodes.length);
      const categoryName = 'Out of Office';
      const OOFActivityCodes = await activityCodes.filter(ac => ac.activityCodeCategory.title === categoryName);
      console.log('OOFActivityCodes', await OOFActivityCodes.length);
      activityCode = OOFActivityCodes[0];
      const allotmentsPerDay = [
        {
          day: Days.All,
          type: 'Hours',
          value: 60,
          enabled: false
        },
        {
          day: Days.Monday,
          type: 'Hours',
          value: 25,
          enabled: true
        }
      ];
      await automaticApprovalRulesComponentPage.createAutoApprovalRule_noUI(ruleName,
        activeStatus,
        [suValues_1],
        [activityCode],
        TimeRestrictionTypes.TimeFrame,
        null,
        365,
        365,
        180,
        true,
        false,
        allotmentsPerDay,
        true,
        await adminUser.token,
        false, adminUser.orgName);
      await automaticApprovalRulesComponentPage.createAutoApprovalRule_noUI(ruleName2,
        inactiveStatus,
        [suValues_1],
        [activityCode],
        TimeRestrictionTypes.TimeFrame,
        null,
        365,
        365,
        180,
        true,
        false,
        allotmentsPerDay,
        true,
        await adminUser.token,
        false, adminUser.orgName);
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      console.log('Hard refresh');
      await automaticApprovalRulesComponentPage.navigateTo();
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      console.log('Auto Approval Rule Created Successfully...');
    });

    test('should validate grid UI has added one new rule successfully', async () => {
      await automaticApprovalRulesComponentPage.navigateTo();
      await CommonUIUtils.waitUntilIconLoaderDone(page);

      const rulesCount = 0, expectedRowCount = 2;
      await automaticApprovalRulesComponentPage.waitForGrid();
      const isAutomaticApprovalRulesPageWrapperPresent = await automaticApprovalRulesComponentPage.wrapperIsPresent();
      expect(isAutomaticApprovalRulesPageWrapperPresent).toBeTruthy();
      let currentRuleCount = await automaticApprovalRulesComponentPage.getGridRowCount();
      expect(currentRuleCount).toEqual(expectedRowCount - 1);
      await automaticApprovalRulesComponentPage.clickOnActiveOnlyFilter();
      console.log('before waiting to currentRuleCount: ' + currentRuleCount);

      currentRuleCount = await automaticApprovalRulesComponentPage.getGridRowCount();
      expect(currentRuleCount).toEqual(expectedRowCount);
      const rName = await automaticApprovalRulesComponentPage.getCellTextByRowAndColumnId(rulesCount, columnIds.NAME);
      expect(rName).toEqual(ruleName);

      const activityCodes = await automaticApprovalRulesComponentPage.getTagsArrayFromTableCell(rulesCount, columnIds.ACTIVITY_CODES);
      expect(activityCodes).toEqual(activityCode.title);
      const schedulingUnits = await automaticApprovalRulesComponentPage.getTagsArrayFromTableCell(rulesCount, columnIds.SCHEDULING_UNITS);
      expect(schedulingUnits).toEqual(suValues_1.name);
      const ruleStatus = await automaticApprovalRulesComponentPage.getCellTextByRowAndColumnId(rulesCount, columnIds.STATUS);
      expect(ruleStatus).toEqual(activeStatus);
    });

    test('should validate activate / deactivate rule status successfully', async () => {
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      const rulesCount = 0;
      await automaticApprovalRulesComponentPage.clickOnDeactivateSingleRowButton(rulesCount);
      await CommonUIUtils.waitUntilIconLoaderDone(page, 3000);
      let ruleStatus = await automaticApprovalRulesComponentPage.getCellTextByRowAndColumnId(rulesCount, columnIds.STATUS);
      expect(ruleStatus).toEqual(inactiveStatus);
      await automaticApprovalRulesComponentPage.clickOnActivateSingleRowButton(rulesCount);
      await CommonUIUtils.waitUntilIconLoaderDone(page, 3000);
      ruleStatus = await automaticApprovalRulesComponentPage.getCellTextByRowAndColumnId(rulesCount, columnIds.STATUS);
      expect(ruleStatus).toEqual(activeStatus);
    });

    test('should validate grid Active Only filter successfully', async () => {
      const expectedRowCount = 1;
      await automaticApprovalRulesComponentPage.clickOnActiveOnlyFilter();
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      let gridCount = await automaticApprovalRulesComponentPage.getGridRowCount();
      expect(gridCount).toEqual(expectedRowCount);
      await automaticApprovalRulesComponentPage.clickOnActiveOnlyFilter();
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      gridCount = await automaticApprovalRulesComponentPage.getGridRowCount();
      expect(gridCount).toEqual(expectedRowCount + expectedRowCount);
    });

    test('should validate grid search text filter successfully', async () => {
      const expectedRowCount = 1, textSearch = '2';
      await automaticApprovalRulesComponentPage.setSearchQuery(textSearch);
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      const gridCount = await automaticApprovalRulesComponentPage.getGridRowCount();
      console.log('1) Current grid rows count: ' + gridCount);
      expect(gridCount).toEqual(expectedRowCount);
      console.log('Hard refresh');
      await automaticApprovalRulesComponentPage.navigateTo();
      await CommonUIUtils.waitUntilIconLoaderDone(page);
    });

    test('should validate delete rule successfully', async () => {
      const expectedRowCount = 1;
      await automaticApprovalRulesComponentPage.waitForGrid();
      await automaticApprovalRulesComponentPage.clickOnActiveOnlyFilter();
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      await automaticApprovalRulesComponentPage.clickOnDeleteSingleRowButton(expectedRowCount);
      await automaticApprovalRulesComponentPage.clickPopupConfirmDeleteButton();
      await CommonUIUtils.waitUntilIconLoaderDone(page);
      const gridCount = await automaticApprovalRulesComponentPage.getGridRowCount();
      console.log('1) Current grid rows count after delete: ' + gridCount);
      expect(gridCount).toEqual(expectedRowCount);
    });

  });

  test.afterAll(async ({ browser }) => {
    const logoutPage = new PageObjects.LogoutPage(page);
    await logoutPage.logout();
    await browser.close();
    console.log('AfterAll() :: Execution end ');
  });

});

