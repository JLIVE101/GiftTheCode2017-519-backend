CREATE TABLE member (
	dbIndex INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	memberCardNumber CHAR(36) NULL,
	memberId CHAR(36) DEFAULT '00000000-0000-0000-0000-000000000000', 
	apartmentNumber VARCHAR(10),
	streetNumber VARCHAR(10) NOT NULL,
	street VARCHAR(50) NOT NULL,
	city VARCHAR(30) NOT NULL,
	provinceState CHAR(2) NOT NULL,
	country VARCHAR(50) NOT NULL,
	postalCode VARCHAR(10) NOT NULL,
	phone VARCHAR(10) NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
	email VARCHAR(60) NOT NULL UNIQUE,
	membershipType INT NOT NULL,
	permSolicit TINYINT(1) NOT NULL,
	permNewsletter TINYINT(1) NOT NULL,
	birthDate DATE,
	inCatchment TINYINT(1) NOT NULL DEFAULT 0,
	dateCreated DATETIME NOT NULL DEFAULT NOW(),
	testimony MEDIUMTEXT NOT NULL
);

CREATE TRIGGER beforeInsertMember
	BEFORE INSERT ON member
	FOR EACH ROW
	SET new.memberId = uuid();

CREATE TABLE login (
	dbIndex INT NOT NULL,
	password CHAR(60) BINARY NOT NULL,
	resetHash CHAR(36) DEFAULT '00000000-0000-0000-0000-000000000000', 
	lastLogin DATETIME DEFAULT NOW(),
	FOREIGN KEY (dbIndex) 
		REFERENCES member (dbIndex)
		ON DELETE CASCADE
);

CREATE TABLE status (
	dbIndex INT NOT NULL,
	active TINYINT(1) NOT NULL DEFAULT 0,
	confirmationHash CHAR(36),
	renewalDate DATETIME DEFAULT NOW(),
	FOREIGN KEY (dbIndex) 
		REFERENCES member(dbIndex) 
		ON DELETE CASCADE
);


CREATE TRIGGER beforeInsertStatus
	BEFORE INSERT ON status
	FOR EACH ROW
	SET new.confirmationHash = uuid();

CREATE TABLE category (
	categoryId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	categoryName VARCHAR(50) NOT NULL
);

CREATE TABLE memberPreference (
	dbIndex INT NOT NULL,
	categoryId INT NOT NULL,
	isPreferred TINYINT(1) NOT NULL,
	FOREIGN KEY (dbIndex) 
		REFERENCES member (dbIndex) 
		ON DELETE CASCADE,
	FOREIGN KEY (categoryId) 
		REFERENCES category (categoryId) 
		ON DELETE CASCADE
);

CREATE TABLE event (
	eventId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	eventName VARCHAR(100) NOT NULL,
	description VARCHAR(100) NOT NULL,
	eventBriteLink VARCHAR(80)
);

CREATE TABLE eventCategory (
	eventId INT NOT NULL,
	categoryId INT NOT NULL,
	isRelatedCategory TINYINT(1) NOT NULL,
	FOREIGN KEY (eventId) 
		REFERENCES event (eventId) 
		ON DELETE CASCADE,
	FOREIGN KEY (categoryId) 
		REFERENCES category (categoryId) 
		ON DELETE CASCADE
);