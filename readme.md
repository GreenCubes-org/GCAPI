# GreenCubes API
### 0.1.0

Application Programming Interface for [GreenCubes](http://greencubes.org)-related web-applications. Inspired by [GCMap](http://gcmap.ru).

## Features

### Authorization
### Basic player info
* Login
* Last seen
* Skin URL
* Registration date
* Prefix
* Nickname color

### Server info
* Name
* Server status
* Players count

## Troubleshooting
#### ```"Error: ER_DUP_FIELDNAME: Duplicate column name '_waterline_dummy02492'"```
Run this sql code in your application MySQL DB for fixing. Or use node.js script in scripts/fix-db.js
```SQL
ALTER TABLE `authcode` DROP `_waterline_dummy02492`;
ALTER TABLE `client` DROP `_waterline_dummy02492`;
ALTER TABLE `token` DROP `_waterline_dummy02492`;
```

## Authors
**Realisation** by *Kern0 aka Arseniy Maximov*.
**Inspired** by problems of typical enthusiasts, they don't have access for basic information about players for making cool services. Hello  [gcmap.ru](http://gcmap.ru) without good authorization, [gc-card.ru](http://gc-card.ru) without good access to last seen, skins and registration date (i think, you need auth for this cool things?).
