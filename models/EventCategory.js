module.exports = function(sequelize, DataTypes) {
    var EventCategory = sequelize.define('EventCategory', {
        eventId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        isRelatedCategory: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'eventcategory'
    });

    return EventCategory;
};