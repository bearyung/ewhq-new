using Microsoft.EntityFrameworkCore;
using EWHQ.Api.Models.Entities;
using EWHQ.Api.Data.Attributes;
using System.Reflection;
using System.ComponentModel.DataAnnotations;

namespace EWHQ.Api.Data;

/// <summary>
/// Database context for EWHQ Portal (POS system) data
/// This file is auto-generated. Do not modify directly.
/// Generated on: 2025-07-14 13:39:03
/// </summary>
public class EWHQDbContext : DbContext
{
    public EWHQDbContext(DbContextOptions<EWHQDbContext> options) : base(options)
    {
    }

    #region DbSets

    public DbSet<AccountMaster> AccountMasters { get; set; }
    public DbSet<Address> Addresses { get; set; }
    public DbSet<AddressBook> AddressBooks { get; set; }
    public DbSet<AddressDeliveryMapping> AddressDeliveryMappings { get; set; }
    public DbSet<AddressGroup> AddressGroups { get; set; }
    public DbSet<AddressMasterArea> AddressMasterAreas { get; set; }
    public DbSet<AddressMasterBuilding> AddressMasterBuildings { get; set; }
    public DbSet<AddressMasterDistrict> AddressMasterDistricts { get; set; }
    public DbSet<AddressMasterEstate> AddressMasterEstates { get; set; }
    public DbSet<AddressMasterShop> AddressMasterShops { get; set; }
    public DbSet<AddressMasterStreet> AddressMasterStreets { get; set; }
    public DbSet<AuditTrailLog> AuditTrailLogs { get; set; }
    public DbSet<BatchEditTaskDetail> BatchEditTaskDetails { get; set; }
    public DbSet<BatchEditTaskHeader> BatchEditTaskHeaders { get; set; }
    public DbSet<BatchEditTaskShopDetail> BatchEditTaskShopDetails { get; set; }
    // public DbSet<Brand> Brands { get; set; } // Moved to AdminPortalDbContext
    public DbSet<BundlePromoOverview> BundlePromoOverviews { get; set; }
    public DbSet<ButtonStyleMaster> ButtonStyleMasters { get; set; }
    public DbSet<CashDrawerDetail> CashDrawerDetails { get; set; }
    public DbSet<CashDrawerHeader> CashDrawerHeaders { get; set; }
    public DbSet<CleanLocalSalesDataLog> CleanLocalSalesDataLogs { get; set; }
    public DbSet<CommandLog> CommandLogs { get; set; }
    // public DbSet<Company> Companies { get; set; } // Moved to AdminPortalDbContext
    // public DbSet<Coupon> Coupons { get; set; }
    // public DbSet<CouponCampaign> CouponCampaigns { get; set; }
    // public DbSet<CouponCampaignDistShopMapping> CouponCampaignDistShopMappings { get; set; }
    // public DbSet<CouponCampaignMemberMapping> CouponCampaignMemberMappings { get; set; }
    // public DbSet<CouponCampaignMemberTypeMapping> CouponCampaignMemberTypeMappings { get; set; }
    // public DbSet<CouponCampaignMemberUsedCount> CouponCampaignMemberUsedCounts { get; set; }
    // public DbSet<CouponCampaignRedeemAccountMapping> CouponCampaignRedeemAccountMappings { get; set; }
    // public DbSet<CouponCampaignRedeemShopMapping> CouponCampaignRedeemShopMappings { get; set; }
    // public DbSet<CouponDistributionLog> CouponDistributionLogs { get; set; }
    // public DbSet<CouponMemberWallet> CouponMemberWallets { get; set; }
    // public DbSet<CouponRedeemLog> CouponRedeemLogs { get; set; }
    public DbSet<DbMasterTableTranslation> DbMasterTableTranslations { get; set; }
    public DbSet<Department> Departments { get; set; }
    public DbSet<DepartmentOnlineMetadata> DepartmentOnlineMetadatas { get; set; }
    public DbSet<DeviceTerminal> DeviceTerminals { get; set; }
    public DbSet<DeviceTerminalModel> DeviceTerminalModels { get; set; }
    public DbSet<DeviceUsageLogOnline> DeviceUsageLogOnlines { get; set; }
    public DbSet<Discount> Discounts { get; set; }
    public DbSet<DiscountShopDetail> DiscountShopDetails { get; set; }
    public DbSet<EmailReportLog> EmailReportLogs { get; set; }
    public DbSet<EmailReportTaskerHeader> EmailReportTaskerHeaders { get; set; }
    public DbSet<EmailReportTaskerParamDetail> EmailReportTaskerParamDetails { get; set; }
    //public DbSet<InlineCustomer> InlineCustomers { get; set; }
    //public DbSet<InlineReservation> InlineReservations { get; set; }
    public DbSet<ItemCategory> ItemCategories { get; set; }
    public DbSet<ItemCategoryShopDetail> ItemCategoryShopDetails { get; set; }
    public DbSet<ItemMaster> ItemMasters { get; set; }
    public DbSet<ItemMasterGroupRight> ItemMasterGroupRights { get; set; }
    public DbSet<ItemMasterMetaOnline> ItemMasterMetaOnlines { get; set; }
    public DbSet<ItemModifierGroupMapping> ItemModifierGroupMappings { get; set; }
    public DbSet<ItemOrderChannelMapping> ItemOrderChannelMappings { get; set; }
    public DbSet<ItemPrice> ItemPrices { get; set; }
    public DbSet<ItemPriceRuleGroupMapping> ItemPriceRuleGroupMappings { get; set; }
    public DbSet<ItemSet> ItemSets { get; set; }
    public DbSet<ItemShopDetail> ItemShopDetails { get; set; }
    public DbSet<ItemShopDetailOnlineMetaData> ItemShopDetailOnlineMetaData { get; set; }
    public DbSet<ItemSoldOutHistory> ItemSoldOutHistories { get; set; }
    public DbSet<ItemSOP> ItemSOPs { get; set; }
    public DbSet<KdsTxDetail> KdsTxDetails { get; set; }
    public DbSet<KdsTxHeader> KdsTxHeaders { get; set; }
    public DbSet<KdsTxLog> KdsTxLogs { get; set; }
    public DbSet<LoyaltyHeader> LoyaltyHeaders { get; set; }
    public DbSet<MediaLibrary> MediaLibraries { get; set; }
    // public DbSet<MemberDetail> MemberDetails { get; set; }
    // public DbSet<MemberHeader> MemberHeaders { get; set; }
    //public DbSet<MemberOnlineDetail> MemberOnlineDetails { get; set; }
    //public DbSet<MemberShopDetail> MemberShopDetails { get; set; }
    //public DbSet<MemberTxLog> MemberTxLogs { get; set; }
    public DbSet<MenuDetail> MenuDetails { get; set; }
    public DbSet<MenuHeader> MenuHeaders { get; set; }
    public DbSet<MenuHeaderMetaOnline> MenuHeaderMetaOnlines { get; set; }
    public DbSet<MenuShopDetail> MenuShopDetails { get; set; }
    public DbSet<ModifierGroupDetail> ModifierGroupDetails { get; set; }
    public DbSet<ModifierGroupHeader> ModifierGroupHeaders { get; set; }
    public DbSet<ModifierGroupOnlineDetail> ModifierGroupOnlineDetails { get; set; }
    public DbSet<ModifierGroupShopDetail> ModifierGroupShopDetails { get; set; }
    public DbSet<OclClientXFileUpload> OclClientXFileUploads { get; set; }
    public DbSet<OclServerFileDownload> OclServerFileDownloads { get; set; }
    public DbSet<OrderChannel> OrderChannels { get; set; }
    public DbSet<PayInOut> PayInOuts { get; set; }
    public DbSet<PaymentMethod> PaymentMethods { get; set; }
    public DbSet<PaymentMethodShopDetail> PaymentMethodShopDetails { get; set; }
    //public DbSet<PreprintedCouponAvtivityLog> PreprintedCouponAvtivityLogs { get; set; }
    //public DbSet<PreprintedCouponSellingDiscount> PreprintedCouponSellingDiscounts { get; set; }
    //public DbSet<PreprintedCouponSellingRule> PreprintedCouponSellingRules { get; set; }
    //public DbSet<PreprintedCouponType> PreprintedCouponTypes { get; set; }
    public DbSet<PriceRule> PriceRules { get; set; }
    public DbSet<PriceRuleGroup> PriceRuleGroups { get; set; }
    public DbSet<PrintDepartmentSlipLog> PrintDepartmentSlipLogs { get; set; }
    //public DbSet<PrintJobDetail> PrintJobDetails { get; set; }
    public DbSet<PromoDetail> PromoDetails { get; set; }
    public DbSet<PromoHeader> PromoHeaders { get; set; }
    public DbSet<PromoShopDetail> PromoShopDetails { get; set; }
//    public DbSet<RawMaterialCategoryOnline> RawMaterialCategoryOnlines { get; set; }
//    public DbSet<RawMaterialDepartmentOnline> RawMaterialDepartmentOnlines { get; set; }
//    public DbSet<RawMaterialItemMasterSetting> RawMaterialItemMasterSettings { get; set; }
//    public DbSet<RawMaterialMaster> RawMaterialMasters { get; set; }
//    public DbSet<RawMaterialMasterSupplierMappingOnline> RawMaterialMasterSupplierMappingOnlines { get; set; }
//    public DbSet<RawMaterialOnlineMetaData> RawMaterialOnlineMetaData { get; set; }
//    public DbSet<RawMaterialShopDetail> RawMaterialShopDetails { get; set; }
//    public DbSet<RawMaterialShopDetailOnlineMetaData> RawMaterialShopDetailOnlineMetaData { get; set; }
//    public DbSet<RawMaterialTxSalesDetail> RawMaterialTxSalesDetails { get; set; }
    public DbSet<Reason> Reasons { get; set; }
    public DbSet<ReasonGroup> ReasonGroups { get; set; }
    //public DbSet<Report> Reports { get; set; }
    //public DbSet<ReportAccountMappingOnline> ReportAccountMappingOnlines { get; set; }
    //public DbSet<ReportAccountMasterOnline> ReportAccountMasterOnlines { get; set; }
    //public DbSet<ReportParameter> ReportParameters { get; set; }
    //public DbSet<ReportParameterType> ReportParameterTypes { get; set; }
    public DbSet<ReportTurnoverDetail> ReportTurnoverDetails { get; set; }
    public DbSet<ReportTurnoverHeader> ReportTurnoverHeaders { get; set; }
    public DbSet<ReportTurnoverItemType> ReportTurnoverItemTypes { get; set; }
    public DbSet<RevenueCenterMaster> RevenueCenterMasters { get; set; }
    public DbSet<Roster> Rosters { get; set; }
    public DbSet<SelfOrderingMediaMaster> SelfOrderingMediaMasters { get; set; }
    public DbSet<SelfOrderingMediaShopDetail> SelfOrderingMediaShopDetails { get; set; }
    public DbSet<ServiceCharge> ServiceCharges { get; set; }
    public DbSet<ServiceChargeShopDetail> ServiceChargeShopDetails { get; set; }
    public DbSet<Shop> Shops { get; set; }
    public DbSet<ShopCodeSettingOnline> ShopCodeSettingOnlines { get; set; }
    public DbSet<ShopGroupSettingHeader> ShopGroupSettingHeaders { get; set; }
    public DbSet<ShopPriceRuleMapping> ShopPriceRuleMappings { get; set; }
    public DbSet<ShopPrinterMaster> ShopPrinterMasters { get; set; }
    public DbSet<ShopServiceAreaSetting> ShopServiceAreaSettings { get; set; }
    public DbSet<ShopSystemParameter> ShopSystemParameters { get; set; }
    public DbSet<ShopTimeSlotDetailOnline> ShopTimeSlotDetailOnlines { get; set; }
    public DbSet<ShopTimeSlotHeaderOnline> ShopTimeSlotHeaderOnlines { get; set; }
    public DbSet<ShopType> ShopTypes { get; set; }
    public DbSet<ShopWorkdayDetail> ShopWorkdayDetails { get; set; }
    public DbSet<ShopWorkdayHeader> ShopWorkdayHeaders { get; set; }
    public DbSet<ShopWorkdayHoliday> ShopWorkdayHolidays { get; set; }
    public DbSet<ShopWorkdayPeriod> ShopWorkdayPeriods { get; set; }
    public DbSet<ShopWorkdayPeriodDetail> ShopWorkdayPeriodDetails { get; set; }
    public DbSet<SmartCategory> SmartCategories { get; set; }
    public DbSet<SmartCategoryItemDetail> SmartCategoryItemDetails { get; set; }
    public DbSet<SmartCategoryOrderChannelMapping> SmartCategoryOrderChannelMappings { get; set; }
    public DbSet<SmartCategoryShopDetail> SmartCategoryShopDetails { get; set; }
    //public DbSet<SmsReportLog> SmsReportLogs { get; set; }
    //public DbSet<SmsReportTaskerHeader> SmsReportTaskerHeaders { get; set; }
    //public DbSet<SmsReportTaskerParamDetail> SmsReportTaskerParamDetails { get; set; }
    //public DbSet<SmsReportTaskerSmsToDetail> SmsReportTaskerSmsToDetails { get; set; }
    public DbSet<StaffAttendanceDetailOnline> StaffAttendanceDetailOnlines { get; set; }
    public DbSet<StaffAttendanceHeaderOnline> StaffAttendanceHeaderOnlines { get; set; }
    //public DbSet<StaffMessingAccount> StaffMessingAccounts { get; set; }
    //public DbSet<StaffMessingAccountType> StaffMessingAccountTypes { get; set; }
    //public DbSet<StockAdjustment> StockAdjustments { get; set; }
    //public DbSet<StockBulkUnitMapping> StockBulkUnitMappings { get; set; }
    //public DbSet<StockLevelShopDetail> StockLevelShopDetails { get; set; }
    //public DbSet<StockOrderDetail> StockOrderDetails { get; set; }
    //public DbSet<StockOrderDetailMetaOnline> StockOrderDetailMetaOnlines { get; set; }
    //public DbSet<StockOrderDetailReceiveOnline> StockOrderDetailReceiveOnlines { get; set; }
    //public DbSet<StockOrderHeader> StockOrderHeaders { get; set; }
    //public DbSet<StockOrderHeaderMetaOnline> StockOrderHeaderMetaOnlines { get; set; }
    //public DbSet<StockTakeDetail> StockTakeDetails { get; set; }
    //public DbSet<StockTakeDetailEndingOnline> StockTakeDetailEndingOnlines { get; set; }
    //public DbSet<StockTakeDetailEndingTranOutOnline> StockTakeDetailEndingTranOutOnlines { get; set; }
    //public DbSet<StockTakeHeader> StockTakeHeaders { get; set; }
    //public DbSet<StockTakeHeaderMetaOnline> StockTakeHeaderMetaOnlines { get; set; }
    //public DbSet<SupplierMaster> SupplierMasters { get; set; }
    public DbSet<SystemParameter> SystemParameters { get; set; }
    public DbSet<TableMaster> TableMasters { get; set; }
    public DbSet<TableOrderTokenMapping> TableOrderTokenMappings { get; set; }
    public DbSet<TableSection> TableSections { get; set; }
    public DbSet<TableSectionShopDetail> TableSectionShopDetails { get; set; }
    public DbSet<TableStatus> TableStatuses { get; set; }
    public DbSet<TableType> TableTypes { get; set; }
    //public DbSet<TaiwanUniformInvoiceBasic> TaiwanUniformInvoiceBasics { get; set; }
    //public DbSet<TaiwanUniformInvoiceBody> TaiwanUniformInvoiceBodies { get; set; }
    //public DbSet<TaiwanUniformInvoiceC0501> TaiwanUniformInvoiceC0501s { get; set; }
    //public DbSet<TaiwanUniformInvoiceComponent> TaiwanUniformInvoiceComponents { get; set; }
    //public DbSet<TaiwanUniformInvoiceHeader> TaiwanUniformInvoiceHeaders { get; set; }
    //public DbSet<TaiwanUniformInvoiceInvoice> TaiwanUniformInvoiceInvoices { get; set; }
    public DbSet<Taxation> Taxations { get; set; }
    public DbSet<TaxationShopDetail> TaxationShopDetails { get; set; }
    public DbSet<ThirdPartyMenuItemMappingOnline> ThirdPartyMenuItemMappingOnlines { get; set; }
    public DbSet<ThirdPartyReservation> ThirdPartyReservations { get; set; }
    public DbSet<TxPayment> TxPayments { get; set; }
    public DbSet<TxReceiptReprintLog> TxReceiptReprintLogs { get; set; }
    public DbSet<TxSalesAction> TxSalesActions { get; set; }
    public DbSet<TxSalesDeliveryDetail> TxSalesDeliveryDetails { get; set; }
    public DbSet<TxSalesDeliveryHeader> TxSalesDeliveryHeaders { get; set; }
    public DbSet<TxSalesDeliveryService> TxSalesDeliveryServices { get; set; }
    public DbSet<TxSalesDetail> TxSalesDetails { get; set; }
    public DbSet<TxSalesDetailLog> TxSalesDetailLogs { get; set; }
    public DbSet<TxSalesDetailVariance> TxSalesDetailVariances { get; set; }
    public DbSet<TxSalesHeader> TxSalesHeaders { get; set; }
    public DbSet<TxSalesHeaderAddress> TxSalesHeaderAddresses { get; set; }
    public DbSet<TxSalesHeaderLog> TxSalesHeaderLogs { get; set; }
    public DbSet<TxSalesHeaderOnlineMeta> TxSalesHeaderOnlineMetas { get; set; }
    public DbSet<TxSalesHeaderRevokeLog> TxSalesHeaderRevokeLogs { get; set; }
    //public DbSet<TxSalesOfflineCouponDistLog> TxSalesOfflineCouponDistLogs { get; set; }
    public DbSet<TxSalesParam> TxSalesParams { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserGroupDetail> UserGroupDetails { get; set; }
    public DbSet<UserGroupDetailOnline> UserGroupDetailOnlines { get; set; }
    public DbSet<UserGroupHeader> UserGroupHeaders { get; set; }
    public DbSet<UserGroupRight> UserGroupRights { get; set; }
    public DbSet<UserGroupRightCode> UserGroupRightCodes { get; set; }
    public DbSet<UserOnlineMeta> UserOnlineMetas { get; set; }
    public DbSet<WorkdayPeriodMaster> WorkdayPeriodMasters { get; set; }

    #endregion

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure composite keys and special entity configurations
        ConfigureEntityKeys(modelBuilder);

        // Apply database-specific configurations
        ApplyDatabaseSpecificConfigurations(modelBuilder);
    }

    private static void ConfigureEntityKeys(ModelBuilder modelBuilder)
    {
        // Configure composite keys
        modelBuilder.Entity<Address>()
            .HasKey(e => new { e.AddressId, e.AccountId, e.ShopId });

        modelBuilder.Entity<AddressBook>()
            .HasKey(e => new { e.AddressBookId, e.AccountId });

        modelBuilder.Entity<AddressDeliveryMapping>()
            .HasKey(e => new { e.DeliveryId, e.AccountId, e.ShopId });

        modelBuilder.Entity<AddressGroup>()
            .HasKey(e => new { e.AddressGroupId, e.AccountId });

        modelBuilder.Entity<AddressMasterArea>()
            .HasKey(e => new { e.AreaId, e.AccountId });

        modelBuilder.Entity<AddressMasterBuilding>()
            .HasKey(e => new { e.BuildingId, e.AccountId });

        modelBuilder.Entity<AddressMasterDistrict>()
            .HasKey(e => new { e.DistrictId, e.AccountId });

        modelBuilder.Entity<AddressMasterEstate>()
            .HasKey(e => new { e.EstateId, e.AccountId });

        modelBuilder.Entity<AddressMasterShop>()
            .HasKey(e => new { e.ShopId, e.AccountId });

        modelBuilder.Entity<AddressMasterStreet>()
            .HasKey(e => new { e.StreetId, e.AccountId });

        modelBuilder.Entity<AuditTrailLog>()
            .HasKey(e => new { e.LogId, e.AccountId, e.ShopId });

        modelBuilder.Entity<BatchEditTaskDetail>()
            .HasKey(e => new { e.TaskDetailId, e.AccountId });

        modelBuilder.Entity<BatchEditTaskHeader>()
            .HasKey(e => new { e.TaskId, e.AccountId });

        modelBuilder.Entity<BatchEditTaskShopDetail>()
            .HasKey(e => new { e.TaskId, e.AccountId, e.ShopId });

        modelBuilder.Entity<BundlePromoOverview>()
            .HasKey(e => new { e.BundlePromoOverviewId, e.AccountId });

        modelBuilder.Entity<ButtonStyleMaster>()
            .HasKey(e => new { e.ButtonStyleId, e.AccountId });

        modelBuilder.Entity<ButtonStyleMaster>()
            .ToTable(tb => tb.HasTrigger("trigger_ButtonStyleMaster_UpdatedDate"));

        modelBuilder.Entity<CashDrawerHeader>()
            .HasKey(e => new { e.CashDrawerCode, e.AccountId, e.ShopId });

        modelBuilder.Entity<CashDrawerDetail>()
            .HasKey(e => new { e.CashDrawerDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<CleanLocalSalesDataLog>()
            .HasKey(e => new { e.CleanLocalSalesDataLogId, e.AccountId, e.ShopId });

        // modelBuilder.Entity<CouponCampaign>()
        //     .HasKey(e => new { e.CouponCampaignId, e.AccountId });
        //
        // modelBuilder.Entity<CouponCampaignDistShopMapping>()
        //     .HasKey(e => new { e.CouponCampaignId, e.AccountId, e.ShopId });
        //
        // modelBuilder.Entity<Coupon>()
        //     .HasKey(e => new { e.CouponCode, e.AccountId });

        // // CouponCampaignMemberMapping composite key
        // modelBuilder.Entity<CouponCampaignMemberMapping>()
        //     .HasKey(e => new { e.CouponCampaignId, e.MemberId });
        //
        // // CouponCampaignMemberTypeMapping composite key
        // modelBuilder.Entity<CouponCampaignMemberTypeMapping>()
        //     .HasKey(e => new { e.CouponCampaignId, e.MemberTypeId });
        //
        // // CouponCampaignMemberUsedCount composite key
        // modelBuilder.Entity<CouponCampaignMemberUsedCount>()
        //     .HasKey(e => new { e.CouponCampaignId, e.AccountId, e.MemberDetailId });
        //
        // // CouponCampaignRedeemAccountMapping composite key
        // modelBuilder.Entity<CouponCampaignRedeemAccountMapping>()
        //     .HasKey(e => new { e.CouponCampaignId, e.RedeemAccountId });
        //
        // modelBuilder.Entity<CouponDistributionLog>()
        //     .HasKey(e => new { e.CouponDistributionLogId, e.AccountId });
        //
        // modelBuilder.Entity<CouponMemberWallet>()
        //     .HasKey(e => new { e.MemberWalletCouponId, e.AccountId });
        //
        // modelBuilder.Entity<CouponRedeemLog>()
        //     .HasKey(e => new { e.CouponRedeemLogId, e.AccountId });

        modelBuilder.Entity<DbMasterTableTranslation>()
            .HasKey(e => new { e.AccountId, e.DbTableName, e.DbFieldName, e.DbFieldId, e.LanguageCode });

        modelBuilder.Entity<Department>()
            .HasKey(e => new { e.DepartmentId, e.AccountId });

        modelBuilder.Entity<DepartmentOnlineMetadata>()
            .HasKey(e => new { e.DepartmentId, e.AccountId });

        modelBuilder.Entity<DeviceTerminal>()
            .HasKey(e => new { e.TerminalId, e.AccountId, e.ShopId });

        modelBuilder.Entity<DeviceUsageLogOnline>()
            .HasKey(e => new { e.DeviceUsageLogOnlineId, e.AccountId, e.ShopId });

        modelBuilder.Entity<Discount>()
            .HasKey(e => new { e.DiscountId, e.AccountId });

        modelBuilder.Entity<DiscountShopDetail>()
            .HasKey(e => new { e.DiscountId, e.AccountId, e.ShopId });

        modelBuilder.Entity<EmailReportTaskerHeader>()
            .HasKey(e => new { e.EmailReportTaskerHeaderId, e.AccountId });

        modelBuilder.Entity<EmailReportTaskerParamDetail>()
            .HasKey(e => new { e.ParamTypeId, e.EmailReportTaskerHeaderId, e.AccountId, e.Deleted });

        modelBuilder.Entity<ItemCategory>()
            .HasKey(e => new { e.CategoryId, e.AccountId });

        modelBuilder.Entity<ItemCategoryShopDetail>()
            .HasKey(e => new { e.CategoryId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ItemMaster>()
            .HasKey(e => new { e.ItemId, e.AccountId });

        modelBuilder.Entity<ItemMasterGroupRight>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.GroupId });

        modelBuilder.Entity<ItemMasterMetaOnline>()
            .HasKey(e => new { e.ItemId, e.AccountId });

        modelBuilder.Entity<ItemModifierGroupMapping>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.GroupHeaderId });

        modelBuilder.Entity<ItemOrderChannelMapping>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.OrderChannelId });

        modelBuilder.Entity<ItemPrice>()
            .HasKey(e => new { e.ItemPriceId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ItemPriceRuleGroupMapping>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.GroupId });

        modelBuilder.Entity<ItemSet>()
            .HasKey(e => new { e.ItemSetId, e.AccountId });

        modelBuilder.Entity<ItemShopDetail>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ItemShopDetailOnlineMetaData>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ItemSoldOutHistory>()
            .HasKey(e => new { e.ItemSoldOutHistoryId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ItemSOP>()
            .HasKey(e => new { e.ItemSOPId, e.AccountId });

        modelBuilder.Entity<KdsTxDetail>()
            .HasKey(e => new { e.KdsTxDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<KdsTxHeader>()
            .HasKey(e => new { e.KdsTxHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<KdsTxLog>()
            .HasKey(e => new { e.KdsTxLogId, e.AccountId, e.ShopId });

        modelBuilder.Entity<LoyaltyHeader>()
            .HasKey(e => new { e.LoyaltyId, e.AccountId, e.ShopId });

        modelBuilder.Entity<MemberDetail>()
            .HasKey(e => new { e.MemberDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<MemberHeader>()
            .HasKey(e => new { e.MemberHeaderId, e.AccountId });

        modelBuilder.Entity<MemberOnlineDetail>()
            .HasKey(e => new { e.MemberOnlineDetailId, e.AccountId });

        modelBuilder.Entity<MenuDetail>()
            .HasKey(e => new { e.AccountId, e.MenuId, e.CategoryId, e.IsSmartCategory });

        modelBuilder.Entity<MenuHeader>()
            .HasKey(e => new { e.MenuId, e.AccountId });

        modelBuilder.Entity<MenuHeaderMetaOnline>()
            .HasKey(e => new { e.MenuId, e.AccountId });

        modelBuilder.Entity<MenuShopDetail>()
            .HasKey(e => new { e.MenuId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ModifierGroupHeader>()
            .HasKey(e => new { e.GroupHeaderId, e.AccountId });

        modelBuilder.Entity<ModifierGroupDetail>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.GroupHeaderId });

        modelBuilder.Entity<ModifierGroupOnlineDetail>()
            .HasKey(e => new { e.AccountId, e.GroupHeaderId });

        modelBuilder.Entity<ModifierGroupShopDetail>()
            .HasKey(e => new { e.GroupHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<OclClientXFileUpload>()
            .HasKey(e => new { e.UploadId, e.AccountId, e.ShopId });

        modelBuilder.Entity<OclServerFileDownload>()
            .HasKey(e => new { e.DownloadId, e.AccountId });

        modelBuilder.Entity<PayInOut>()
            .HasKey(e => new { e.PayInOutId, e.AccountId, e.ShopId });

        modelBuilder.Entity<PaymentMethod>()
            .HasKey(e => new { e.PaymentMethodId, e.AccountId });

        modelBuilder.Entity<PaymentMethodShopDetail>()
            .HasKey(e => new { e.PaymentMethodId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<PreprintedCouponAvtivityLog>()
        //    .HasKey(e => new { e.ActivityLogId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<PreprintedCouponSellingDiscount>()
        //    .HasKey(e => new { e.CouponSellingDiscountId, e.AccountId });

        //modelBuilder.Entity<PreprintedCouponType>()
        //    .HasKey(e => new { e.CouponTypeId, e.AccountId });

        modelBuilder.Entity<PriceRule>()
            .HasKey(e => new { e.RuleId, e.AccountId });

        modelBuilder.Entity<PriceRuleGroup>()
            .HasKey(e => new { e.GroupId, e.AccountId });

        modelBuilder.Entity<PrintDepartmentSlipLog>()
            .HasKey(e => new { e.AccountId, e.ShopId, e.TxSalesHeaderId, e.TxSalesDetailId});

        modelBuilder.Entity<PromoDetail>()
            .HasKey(e => new { e.PromoDetailId, e.AccountId });

        modelBuilder.Entity<PromoHeader>()
            .HasKey(e => new { e.PromoHeaderId, e.AccountId });

        modelBuilder.Entity<PromoShopDetail>()
            .HasKey(e => new { e.PromoHeaderId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<RawMaterialDepartmentOnline>()
        //    .HasKey(e => new { e.RawMaterialDepartmentId, e.AccountId });

        //modelBuilder.Entity<RawMaterialMaster>()
        //    .HasKey(e => new { e.RawMaterialId, e.AccountId });

        modelBuilder.Entity<Reason>()
            .HasKey(e => new { e.ReasonId, e.AccountId });

        //modelBuilder.Entity<Report>()
        //    .HasKey(e => new { e.ReportId});

        modelBuilder.Entity<ReasonGroup>()
            .HasKey(e => new { e.ReasonGroupId, e.AccountId });

        modelBuilder.Entity<ReportTurnoverDetail>()
            .HasKey(e => new { e.ReportTurnoverDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ReportTurnoverHeader>()
            .HasKey(e => new { e.ReportTurnoverHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ReportTurnoverItemType>()
            .HasKey(e => new { e.ItemTypeId});

        modelBuilder.Entity<RevenueCenterMaster>()
            .HasKey(e => new { e.RevenueCenterId, e.AccountId });

        modelBuilder.Entity<Roster>()
            .HasKey(e => new { e.RosterId, e.AccountId, e.ShopId });

        modelBuilder.Entity<SelfOrderingMediaMaster>()
            .HasKey(e => new { e.MediaId, e.AccountId });

        modelBuilder.Entity<SelfOrderingMediaShopDetail>()
            .HasKey(e => new { e.MediaId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ServiceCharge>()
            .HasKey(e => new { e.ServiceChargeId, e.AccountId });

        modelBuilder.Entity<ServiceChargeShopDetail>()
            .HasKey(e => new { e.ServiceChargeId, e.AccountId, e.ShopId });

        modelBuilder.Entity<Shop>()
            .HasKey(e => new { e.ShopId, e.AccountId });

        modelBuilder.Entity<ShopCodeSettingOnline>()
            .HasKey(e => new { e.AccountId, e.ShopCode });  

        modelBuilder.Entity<ShopGroupSettingHeader>()
            .HasKey(e => new { e.ShopGroupId, e.AccountId });

        modelBuilder.Entity<ShopPriceRuleMapping>()
            .HasKey(e => new { e.RuleId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopPrinterMaster>()
            .HasKey(e => new { e.ShopPrinterMasterId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopServiceAreaSetting>()
            .HasKey(e => new { e.ZoneId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopSystemParameter>()
            .HasKey(e => new { e.ParamId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopTimeSlotDetailOnline>()
            .HasKey(e => new { e.TimeSlotDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopTimeSlotHeaderOnline>()
            .HasKey(e => new { e.TimeSlotHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopType>()
            .HasKey(e => new { e.ShopTypeid, e.AccountId });

        modelBuilder.Entity<ShopWorkdayDetail>()
            .HasKey(e => new { e.WorkdayDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopWorkdayHeader>()
            .HasKey(e => new { e.WorkdayHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopWorkdayHoliday>()
            .HasKey(e => new { e.HolidayId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopWorkdayPeriod>()
            .HasKey(e => new { e.WorkdayPeriodId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ShopWorkdayPeriodDetail>()
            .HasKey(e => new { e.WorkdayPeriodDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<SmartCategory>()
            .HasKey(e => new { e.SmartCategoryId, e.AccountId });

        modelBuilder.Entity<SmartCategoryItemDetail>()
            .HasKey(e => new { e.ItemId, e.AccountId, e.SmartCategoryId });

        modelBuilder.Entity<SmartCategoryOrderChannelMapping>()
            .HasKey(e => new { e.SmartCategoryId, e.AccountId, e.OrderChannelId });

        modelBuilder.Entity<SmartCategoryShopDetail>()
            .HasKey(e => new { e.SmartCategoryId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<SmsReportTaskerHeader>()
        //    .HasKey(e => new { e.SmsReportTaskerHeaderId, e.AccountId });

        modelBuilder.Entity<StaffAttendanceDetailOnline>()
            .HasKey(e => new { e.StaffAttendanceDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<StaffAttendanceHeaderOnline>()
            .HasKey(e => new { e.StaffAttendanceHeaderId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<StaffMessingAccount>()
        //    .HasKey(e => new { e.StaffMessingAccountId, e.AccountId });

        //modelBuilder.Entity<StaffMessingAccountType>()
        //    .HasKey(e => new { e.StaffMessingAccountTypeId, e.AccountId });

        //modelBuilder.Entity<StockBulkUnitMapping>()
        //    .HasKey(e => new { e.BulkUnitId, e.AccountId });

        //modelBuilder.Entity<StockOrderDetail>()
        //    .HasKey(e => new { e.OrderDetailId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<StockOrderDetailReceiveOnline>()
        //    .HasKey(e => new { e.StockOrderDetailId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<StockOrderHeader>()
        //    .HasKey(e => new { e.OrderHeaderId, e.AccountId });

        //modelBuilder.Entity<StockTakeDetail>()
        //    .HasKey(e => new { e.StockTakeDetailId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<StockTakeHeader>()
        //    .HasKey(e => new { e.StockTakeHeaderId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<SupplierMaster>()
        //    .HasKey(e => new { e.SupplierId, e.AccountId });

        modelBuilder.Entity<SystemParameter>()
            .HasKey(e => new { e.ParamId, e.AccountId });

        modelBuilder.Entity<TableMaster>()
            .HasKey(e => new { e.TableId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TableOrderTokenMapping>()
            .HasKey(e => new { e.TableId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TableSection>()
            .HasKey(e => new { e.SectionId, e.AccountId });

        modelBuilder.Entity<TableSectionShopDetail>()
            .HasKey(e => new { e.SectionId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TableStatus>()
            .HasKey(e => new { e.TableStatusId, e.AccountId });

        modelBuilder.Entity<TableType>()
            .HasKey(e => new { e.TableTypeId, e.AccountId });

        modelBuilder.Entity<Taxation>()
            .HasKey(e => new { e.TaxationId, e.AccountId });

        modelBuilder.Entity<TaxationShopDetail>()
            .HasKey(e => new { e.TaxationId, e.AccountId, e.ShopId });

        modelBuilder.Entity<ThirdPartyMenuItemMappingOnline>()
            .HasKey(e => new { e.OrderChannelId, e.AccountId, e.ShopId, e.ItemId, e.ThirdPartyItemOnlineId, e.ParentItemId, e.ModifierGroupHeaderId });

        modelBuilder.Entity<ThirdPartyReservation>()
            .HasKey(e => new { e.ThirdPartyReservationId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxPayment>()
            .HasKey(e => new { e.TxPaymentId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxReceiptReprintLog>()
            .HasKey(e => new { e.TxReceiptReprintLogId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesAction>()
            .HasKey(e => new { e.ActionId });

        modelBuilder.Entity<TxSalesDeliveryDetail>()
            .HasKey(e => new { e.TxSalesDeliveryDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesDeliveryHeader>()
            .HasKey(e => new { e.TxSalesDeliveryHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesDeliveryService>()
            .HasKey(e => new { e.TxSalesDeliveryServiceId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesDetail>()
            .HasKey(e => new { e.TxSalesDetailId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesDetailLog>()
            .HasKey(e => new { e.TxSalesDetailLogId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesDetailVariance>()
            .HasKey(e => new { e.TxSalesDetailVarianceId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesHeader>()
            .HasKey(e => new { e.TxSalesHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesHeaderAddress>()
            .HasKey(e => new { e.TxSalesHeaderId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesHeaderLog>()
            .HasKey(e => new { e.TxSalesHeaderLogId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesHeaderOnlineMeta>()
            .HasKey(e => new { e.TxSalesHeaderOnlineMetaId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesHeaderRevokeLog>()
            .HasKey(e => new { e.TxSalesHeaderRevokeLogId, e.AccountId, e.ShopId });

        //modelBuilder.Entity<TxSalesOfflineCouponDistLog>()
        //    .HasKey(e => new { e.TxSalesOfflineCouponDistLogId, e.AccountId, e.ShopId });

        modelBuilder.Entity<TxSalesParam>()
            .HasKey(e => new { e.AccountId, e.ShopId });

        modelBuilder.Entity<User>()
            .HasKey(e => new { e.UserId, e.AccountId, e.ShopId });

        modelBuilder.Entity<UserGroupDetail>()
            .HasKey(e => new { e.GroupId, e.AccountId, e.ShopId, e.UserId });

        modelBuilder.Entity<UserGroupDetailOnline>()
            .HasKey(e => new { e.GroupId, e.AccountId, e.UserId });

        modelBuilder.Entity<UserGroupHeader>()
            .HasKey(e => new { e.GroupId, e.AccountId });

        modelBuilder.Entity<UserGroupRight>()
            .HasKey(e => new { e.GroupRightId, e.AccountId });

        modelBuilder.Entity<UserGroupRightCode>()
            .HasKey(e => new { e.GroupRightCodeId, e.AccountId });

        modelBuilder.Entity<UserOnlineMeta>()
            .HasKey(e => new { e.UserId, e.AccountId, e.ShopId });

        modelBuilder.Entity<WorkdayPeriodMaster>()
            .HasKey(e => new { e.WorkdayPeriodMasterId, e.AccountId });

        // Shop special configuration
        modelBuilder.Entity<Shop>()
            .Property(s => s.ShopId)
            .ValueGeneratedOnAdd();

    }

    private void ApplyDatabaseSpecificConfigurations(ModelBuilder modelBuilder)
    {
        var isPostgreSQL = Database.IsNpgsql();
        
        // Configure string properties with MaxLengthUnlimited attribute
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if (property.PropertyInfo != null)
                {
                    var maxLengthAttr = property.PropertyInfo.GetCustomAttribute<MaxLengthAttribute>();
                    if (maxLengthAttr is MaxLengthUnlimitedAttribute)
                    {
                        if (isPostgreSQL)
                        {
                            // For PostgreSQL, use text type
                            property.SetColumnType("text");
                        }
                        else
                        {
                            // For SQL Server, use nvarchar(max)
                            property.SetColumnType("nvarchar(max)");
                        }
                    }
                }
            }
        }
    }
}
