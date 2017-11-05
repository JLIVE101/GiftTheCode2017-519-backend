CREATE TABLE member (
	memberId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
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
	email VARCHAR(60) NOT NULL,
	membershipType INT NOT NULL,
	birthDate DATE,
	inCatchment TINYINT(1) NOT NULL DEFAULT 0,
	household TINYINT(1) NOT NULL DEFAULT 0,
	dateCreated DATETIME NOT NULL DEFAULT NOW()
);

CREATE TABLE testimony (
	memberId INT NOT NULL,
	testimony MEDIUMTEXT NOT NULL,
	FOREIGN KEY (memberId) REFERENCES member(memberId) ON DELETE CASCADE
);

CREATE TABLE login (
	memberId INT NOT NULL,
	password CHAR(60) BINARY NOT NULL,
	FOREIGN KEY (memberId) 
		REFERENCES member (memberId)
		ON DELETE CASCADE
);

CREATE TABLE permission (
	permId INT NOT NULL,
	permSolicit TINYINT(1) NOT NULL,
	permNewsletter TINYINT(1) NOT NULL,
	FOREIGN KEY (permId)
			REFERENCES member (memberId)
			ON DELETE CASCADE
);

CREATE TABLE household (
	relationshipId INT NOT NULL,
	relationshipType INT NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50) NOT NULL,
	FOREIGN KEY (relationshipId)
			REFERENCES member (memberId)
			ON DELETE CASCADE
);

CREATE TABLE status (
	memberId INT NOT NULL,
	active TINYINT(1) NOT NULL DEFAULT 0,
	hash CHAR(36),
	lastLogin DATETIME DEFAULT NOW(),
	renewalDate DATETIME DEFAULT NOW(),
	FOREIGN KEY (memberId) REFERENCES member(memberId) ON DELETE CASCADE
);

CREATE TRIGGER beforeInsertStatus
	BEFORE INSERT ON status
	FOR EACH ROW
	SET new.hash = uuid();

CREATE TABLE category (
	categoryId INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
	categoryName VARCHAR(50) NOT NULL
);

CREATE TABLE memberPreference (
	memberId INT NOT NULL,
	categoryId INT NOT NULL,
	isPreferred TINYINT(1) NOT NULL,
	FOREIGN KEY (memberId) REFERENCES member (memberId) ON DELETE CASCADE,
	FOREIGN KEY (categoryId) REFERENCES category (categoryId) ON DELETE CASCADE
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
	FOREIGN KEY (eventId) REFERENCES event (eventId) ON DELETE CASCADE,
	FOREIGN KEY (categoryId) REFERENCES category (categoryId) ON DELETE CASCADE
);