module.exports = function(sequelize, DataTypes) {
    var Event = sequelize.define('Event', {
        eventId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true            
        },
        eventName: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(80),
            allowNull: false
        },
        eventBriteLink: {
            type: DataTypes.STRING(80),
            allowNull: true
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'event'
    });

    // don't need Sequelize-generated id.
    Event.removeAttribute('id');

    return Event;
}