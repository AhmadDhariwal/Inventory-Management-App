
const mongoose = require('mongoose');
const Organization = require('../models/organization');
const User = require('../models/user');
const Product = require('../models/product');
const Warehouse = require('../models/warehouse');
const StockMovement = require('../models/stockmovement');
const PurchaseOrder = require('../models/purchaseorder');
const SalesOrder = require('../models/salesorder');
const Supplier = require('../models/supplier');
const Category = require('../models/category');
const StockLevel = require('../models/stocklevel');
const ActivityLog = require('../models/activitylog');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/inventorymanagement';

async function migrateDatabase() {
    try {
        console.log('🚀 Starting database migration for multi-tenant RBAC...\n');

        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Step 1: Create default organization
        console.log('📦 Step 1: Creating default organization...');
        let defaultOrg = await Organization.findOne({ email: 'default@organization.com' });

        if (!defaultOrg) {
            defaultOrg = await Organization.create({
                name: 'Default Organization',
                email: 'default@organization.com',
                phone: '',
                settings: {
                    timezone: 'UTC',
                    currency: 'USD',
                    dateFormat: 'MM/DD/YYYY'
                },
                subscription: {
                    plan: 'free',
                    status: 'active'
                },
                isActive: true
            });
            console.log(`✅ Created default organization: ${defaultOrg.name} (ID: ${defaultOrg._id})\n`);
        } else {
            console.log(`ℹ️  Default organization already exists (ID: ${defaultOrg._id})\n`);
        }

        const defaultOrgId = defaultOrg._id;

        // Step 2: Migrate users
        console.log('👥 Step 2: Migrating users...');
        const usersWithoutOrg = await User.find({ organizationId: { $exists: false } });
        console.log(`Found ${usersWithoutOrg.length} users without organization`);

        for (const user of usersWithoutOrg) {
            user.organizationId = defaultOrgId;

            // Set default values for new fields
            if (!user.managerId) user.managerId = null;
            if (!user.assignedUsers) user.assignedUsers = [];
            if (!user.createdBy) user.createdBy = null;

            await user.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${usersWithoutOrg.length} users\n`);

        // Get first admin user as default creator
        const defaultAdmin = await User.findOne({ role: 'admin', organizationId: defaultOrgId });
        const defaultCreatorId = defaultAdmin ? defaultAdmin._id : null;

        // Step 3: Migrate products
        console.log('📦 Step 3: Migrating products...');
        const productsWithoutOrg = await Product.find({ organizationId: { $exists: false } });
        console.log(`Found ${productsWithoutOrg.length} products without organization`);

        for (const product of productsWithoutOrg) {
            product.organizationId = defaultOrgId;
            product.createdBy = defaultCreatorId;
            await product.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${productsWithoutOrg.length} products\n`);

        // Step 4: Migrate warehouses
        console.log('🏭 Step 4: Migrating warehouses...');
        const warehousesWithoutOrg = await Warehouse.find({ organizationId: { $exists: false } });
        console.log(`Found ${warehousesWithoutOrg.length} warehouses without organization`);

        for (const warehouse of warehousesWithoutOrg) {
            warehouse.organizationId = defaultOrgId;
            warehouse.createdBy = defaultCreatorId;
            await warehouse.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${warehousesWithoutOrg.length} warehouses\n`);

        // Step 5: Migrate stock movements
        console.log('📊 Step 5: Migrating stock movements...');
        const stockMovementsWithoutOrg = await StockMovement.find({ organizationId: { $exists: false } });
        console.log(`Found ${stockMovementsWithoutOrg.length} stock movements without organization`);

        for (const movement of stockMovementsWithoutOrg) {
            movement.organizationId = defaultOrgId;
            await movement.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${stockMovementsWithoutOrg.length} stock movements\n`);

        // Step 6: Migrate purchase orders
        console.log('🛒 Step 6: Migrating purchase orders...');
        const purchaseOrdersWithoutOrg = await PurchaseOrder.find({ organizationId: { $exists: false } });
        console.log(`Found ${purchaseOrdersWithoutOrg.length} purchase orders without organization`);

        for (const order of purchaseOrdersWithoutOrg) {
            order.organizationId = defaultOrgId;
            await order.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${purchaseOrdersWithoutOrg.length} purchase orders\n`);

        // Step 7: Migrate sales orders
        console.log('💰 Step 7: Migrating sales orders...');
        const salesOrdersWithoutOrg = await SalesOrder.find({ organizationId: { $exists: false } });
        console.log(`Found ${salesOrdersWithoutOrg.length} sales orders without organization`);

        for (const order of salesOrdersWithoutOrg) {
            order.organizationId = defaultOrgId;
            await order.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${salesOrdersWithoutOrg.length} sales orders\n`);

        // Step 8: Migrate suppliers
        console.log('🚚 Step 8: Migrating suppliers...');
        const suppliersWithoutOrg = await Supplier.find({ organizationId: { $exists: false } });
        console.log(`Found ${suppliersWithoutOrg.length} suppliers without organization`);

        for (const supplier of suppliersWithoutOrg) {
            supplier.organizationId = defaultOrgId;
            supplier.createdBy = defaultCreatorId;
            await supplier.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${suppliersWithoutOrg.length} suppliers\n`);

        // Step 9: Migrate categories
        console.log('📁 Step 9: Migrating categories...');
        const categoriesWithoutOrg = await Category.find({ organizationId: { $exists: false } });
        console.log(`Found ${categoriesWithoutOrg.length} categories without organization`);

        for (const category of categoriesWithoutOrg) {
            category.organizationId = defaultOrgId;
            category.createdBy = defaultCreatorId;
            await category.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${categoriesWithoutOrg.length} categories\n`);

        // Step 10: Migrate stock levels
        console.log('📈 Step 10: Migrating stock levels...');
        const stockLevelsWithoutOrg = await StockLevel.find({ organizationId: { $exists: false } });
        console.log(`Found ${stockLevelsWithoutOrg.length} stock levels without organization`);

        for (const level of stockLevelsWithoutOrg) {
            level.organizationId = defaultOrgId;
            await level.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${stockLevelsWithoutOrg.length} stock levels\n`);

        // Step 11: Migrate activity logs
        console.log('📝 Step 11: Migrating activity logs...');
        const activityLogsWithoutOrg = await ActivityLog.find({ organizationId: { $exists: false } });
        console.log(`Found ${activityLogsWithoutOrg.length} activity logs without organization`);

        for (const log of activityLogsWithoutOrg) {
            log.organizationId = defaultOrgId;
            await log.save({ validateBeforeSave: false });
        }
        console.log(`✅ Migrated ${activityLogsWithoutOrg.length} activity logs\n`);

        // Step 12: Validation
        console.log('🔍 Step 12: Validating migration...');
        const validationResults = {
            users: await User.countDocuments({ organizationId: { $exists: false } }),
            products: await Product.countDocuments({ organizationId: { $exists: false } }),
            warehouses: await Warehouse.countDocuments({ organizationId: { $exists: false } }),
            stockMovements: await StockMovement.countDocuments({ organizationId: { $exists: false } }),
            purchaseOrders: await PurchaseOrder.countDocuments({ organizationId: { $exists: false } }),
            salesOrders: await SalesOrder.countDocuments({ organizationId: { $exists: false } }),
            suppliers: await Supplier.countDocuments({ organizationId: { $exists: false } }),
            categories: await Category.countDocuments({ organizationId: { $exists: false } }),
            stockLevels: await StockLevel.countDocuments({ organizationId: { $exists: false } }),
            activityLogs: await ActivityLog.countDocuments({ organizationId: { $exists: false } })
        };

        console.log('\n📊 Validation Results:');
        console.log('Documents without organizationId:');
        Object.entries(validationResults).forEach(([model, count]) => {
            const status = count === 0 ? '✅' : '❌';
            console.log(`  ${status} ${model}: ${count}`);
        });

        const allMigrated = Object.values(validationResults).every(count => count === 0);

        if (allMigrated) {
            console.log('\n✅ Migration completed successfully!');
            console.log('\n⚠️  IMPORTANT NEXT STEPS:');
            console.log('1. All existing users will need to re-login to get new JWT tokens with organizationId');
            console.log('2. Update your frontend to handle the new token structure');
            console.log('3. Test all functionality thoroughly before deploying to production');
            console.log(`4. Default organization ID: ${defaultOrgId}`);
        } else {
            console.log('\n❌ Migration completed with errors. Please review the validation results above.');
        }

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    migrateDatabase()
        .then(() => process.exit(0))
        .catch(error => {
            console.error('Migration error:', error);
            process.exit(1);
        });
}

module.exports = { migrateDatabase };
