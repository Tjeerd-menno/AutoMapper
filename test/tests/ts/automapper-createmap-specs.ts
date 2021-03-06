/// <reference path="../../../tools/typings/jasmine/jasmine.d.ts" />
/// <reference path="../../typings/jasmine-utils.d.ts" />

/// <reference path="../../../dist/arcady-automapper-classes.d.ts" />
/// <reference path="../../../dist/arcady-automapper-interfaces.d.ts" />
/// <reference path="../../../dist/arcady-automapper-declaration.d.ts" />

describe('AutoMapper', () => {
    beforeEach(()=>{
        utils.registerTools(this);
        utils.registerCustomMatchers(this);
    });
	
    it('should have a global automapper object', () => {
        expect(automapper).not.toBeUndefined();
        expect(automapper).not.toBeNull();

        expect(automapper.createMap).not.toBeUndefined();
        expect(automapper.createMap).not.toBeNull();
        expect(typeof automapper.createMap === 'function').toBeTruthy();

        expect(automapper.map).not.toBeUndefined();
        expect(automapper.map).not.toBeNull();
        expect(typeof automapper.map === 'function').toBeTruthy();
    });
        
    it('should throw an error when instantiating the Singleton directly', () => {
        // arrange
        var caught = false;

        // act
        try {
            var mapper = new AutoMapperJs.AutoMapper();
        } catch (e) {
            caught = true;
            // assert
            expect(e.message).toEqual('Instantiation failed: Use getInstance() function instead of constructor function.');
        }
        if (!caught) {
            // assert
            expect(null).fail('Using the AutoMapper constructor should result in an error.');
        }
    });
    
    it('should use created mapping profile', () => {
        // arrange
        var fromKey = '{5700E351-8D88-4327-A216-3CC94A308EDF}';
        var toKey = '{BB33A261-3CA9-48FC-85E6-2C269F73728D}';

        automapper.createMap(fromKey, toKey);

        // act
        automapper.map(fromKey, toKey, {});

        // assert
    });
    
    it('should fail when using a non-existing mapping profile', () => {
        // arrange
        var caught = false;

        var fromKey = '{5AEFD48C-4472-41E7-BA7E-0977A864E116}';
        var toKey = '{568DCA5E-477E-4739-86B2-38BB237B8EF8}';

        // act
        try {
            automapper.map(fromKey, toKey, {});
        } catch (e) {
            caught = true;

            // assert
            expect(e.message).toEqual('Could not find map object with a source of ' + fromKey + ' and a destination of ' + toKey);
        }

        if (!caught) {
            // assert
            expect().fail('Using a non-existing mapping profile should result in an error.');
        }
    });

    it('should accept multiple forMember calls for the same destination property and overwrite with the last one specified', () => {
        //arrange
        var objA = { prop1: 'From A', prop2: 'From A too' };

        var fromKey = '{7AC4134B-ECC1-464B-B144-5B9D8F5B568E}';
        var toKey = '{2BDE907C-1CE6-4CC5-A601-9A94CC665837}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop1', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.mapFrom('prop2'); })
            .forMember('prop1', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.ignore(); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB).toEqualData({ prop2: objA.prop2 });
    });

    it('should be able to ignore a source property using the forSourceMember function', () => {
        // arrange
        var objA = { prop1: 'From A', prop2: 'From A too' };

        var fromKey = '{AD88481E-597B-4C1B-967B-3D700B8BAB0F}';
        var toKey = '{2A6714C4-784E-47D3-BBF4-6205834EC8D5}';

        automapper
            .createMap(fromKey, toKey)
            .forSourceMember('prop1', (opts: AutoMapperJs.ISourceMemberConfigurationOptions) => { opts.ignore(); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB).toEqualData({ prop2: 'From A too' });
    });

    it('should be able to custom map a source property using the forSourceMember function', () => {
        // arrange
        var objA = { prop1: 'From A', prop2: 'From A too' };

        var fromKey = '{AD88481E-597B-4C1B-967B-3D700B8BAB0F}';
        var toKey = '{2A6714C4-784E-47D3-BBF4-6205834EC8D5}';

        automapper
            .createMap(fromKey, toKey)
            .forSourceMember('prop1', (opts: AutoMapperJs.ISourceMemberConfigurationOptions) => { return 'Yeah!'; });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB).toEqualData({ prop1: 'Yeah!', prop2: 'From A too' });
    });

    it('should be able to ignore a source property already specified (by forMember) using the forSourceMember function', () => {
        // arrange
        var objA = { prop1: 'From A', prop2: 'From A too' };

        var fromKey = '{AD88481E-597B-4C1B-967B-3D701B8CAB0A}';
        var toKey = '{2A6714C4-784E-47D3-BBF4-620583DEC86A}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop1', 12)
            .forSourceMember('prop1', (opts: AutoMapperJs.ISourceMemberConfigurationOptions) => { opts.ignore(); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB).toEqualData({ prop2: 'From A too' });
    });

    it('should fail when forSourceMember is used with anything else than a function', () => {
        // arrange
        var caught = false;

        var fromKey = '{5EE20DF9-84B3-4A6A-8C5D-37AEDC44BE87}';
        var toKey = '{986C959D-2E2E-41FA-9857-8EF519467AEB}';

        try {
            // act
            automapper
                .createMap(fromKey, toKey)
                .forSourceMember('prop1', <any>12);
        } catch (e) {
            // assert
            caught = true;
            expect(e.message).toEqual('Configuration of forSourceMember has to be a function with one options parameter.');
        }

        if (!caught) {
            // assert
            expect().fail('Using anything else than a function with forSoruceMember should result in an error.');
        }
    });

    it('should be able to use forMember to map a source property to a destination property with a different name', () => {
        //arrange
        var objA = { prop1: 'From A', prop2: 'From A too' };

        var fromKey = '{7AC4134B-ECC1-464B-B144-5B9D8F5B568E}';
        var toKey = '{2BDE907C-1CE6-4CC5-A601-9A94CC665837}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.mapFrom('prop2'); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB).toEqualData({ prop1: objA.prop1, prop: objA.prop2 });
    });

    it('should use forAllMembers function for each mapped destination property when specified', () => {
        // arrange
        var objA = { prop1: 'From A', prop2: 'From A too' };

        var fromKey = '{C4056539-FA86-4398-A10B-C41D3A791F26}';
        var toKey = '{01C64E8D-CDB5-4307-9011-0C7F1E70D115}';

        var forAllMembersSpy = jasmine.createSpy('forAllMembersSpy').and.callFake((destinationObject: any, destinationProperty: string, value: any) => {
            destinationObject[destinationProperty] = value;
        });

        automapper
            .createMap(fromKey, toKey)
            .forAllMembers(forAllMembersSpy);

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(forAllMembersSpy).toHaveBeenCalled();
        expect(forAllMembersSpy.calls.count()).toBe(Object.keys(objB).length);
    });

    it('should be able to use forMember with a constant value', () => {
        // arrange
        var objA = { prop: 1 };

        var fromKey = '{54E67626-B877-4824-82E6-01E9F411B78F}';
        var toKey = '{2D7FDB88-97E9-45EF-A111-C9CC9C188227}';

        var constantResult = 2;

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop', constantResult);

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.prop).toBe(constantResult);
    });

    it('should be able to use forMember with a function returning a constant value', () => {
        // arrange
        var objA = { prop: 1 };

        var fromKey = '{74C12B56-1DD1-4EA0-A640-D1F814971124}';
        var toKey = '{BBC617B8-26C8-42A0-A204-45CC77073355}';

        var constantResult = 3;

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop', () => { return constantResult });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.prop).toBe(constantResult);
    });

    it('should be able to use forMember with a function using the source object', () => {
        // arrange
        var objA = { prop: { subProp: { value: 1 } } };

        var fromKey = '{54E67626-B877-4824-82E6-01E9F411B78F}';
        var toKey = '{2D7FDB88-97E9-45EF-A111-C9CC9C188227}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop', (opts: AutoMapperJs.IMemberConfigurationOptions) => { return opts.sourceObject[opts.sourcePropertyName].subProp.value * 2; });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.prop).toBe(objA.prop.subProp.value * 2);
    });

    it('should be able to use forMember to ignore a property', () => {
        // arrange
        var objA = { prop: 1 };

        var fromKey = '{76D26B33-888A-4DF7-ABDA-E5B99E944272}';
        var toKey = '{18192391-85FF-4729-9A08-5954FCFE3954}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.ignore(); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.hasOwnProperty('prop')).not.toBeTruthy();
    });

    it('should be able to use forMember to map a source property to a destination property with a different name', () => {
        // arrange
        var objA = { propDiff: 1 };

        var fromKey = '{A317A36A-AD92-4346-A015-AE06FC862DB4}';
        var toKey = '{03B05E43-3028-44FD-909F-652E2DA5E607}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.mapFrom('propDiff'); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.prop).toEqual(objA.propDiff);
    });

    it('should be able to use stack forMember calls to map a source property to a destination property using multiple mapping steps', () => {
        // arrange
        var birthdayString = '2000-01-01T00:00:00.000Z';
        var objA = { birthdayString: birthdayString };

        var fromKey = '{564F1F57-FD4F-413C-A9D3-4B1C1333A20B}';
        var toKey = '{F9F45923-2D13-4EF1-9685-4883AD1D2F98}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('birthday', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.mapFrom('birthdayString'); })
            .forMember('birthday', (opts: AutoMapperJs.IMemberConfigurationOptions) => { return new Date(opts.destinationPropertyValue); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.birthday instanceof Date).toBeTruthy();
        expect(objB.birthday.toISOString()).toEqual('2000-01-01T00:00:00.000Z');
    });

    it('should be able to use stack forMember calls to map a source property to a destination property using multiple mapping steps in any order', () => {
        // arrange
        var birthdayString = '2000-01-01T00:00:00.000Z';
        var objA = { birthdayString: birthdayString };

        var fromKey = '{1609A9B5-6083-448B-8FD6-51DAD106B63D}';
        var toKey = '{47AF7D2D-A848-4C5B-904F-39402E2DCDD5}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('birthday', (opts: AutoMapperJs.IMemberConfigurationOptions) => { return new Date(opts.destinationPropertyValue); })
            .forMember('birthday', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.mapFrom('birthdayString'); });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.birthday instanceof Date).toBeTruthy();
        expect(objB.birthday.toISOString()).toEqual('2000-01-01T00:00:00.000Z');
    });

    it('should not map properties that are not an object\'s own properties', () => {
        var objA = new ClassA();
        objA.propA = 'propA';

        var fromKey = '{A317A36A-AD92-4346-A015-AE06FC862DB4}';
        var toKey = '{03B05E43-3028-44FD-909F-652E2DA5E607}';

        automapper
            .createMap(fromKey, toKey);

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.propA).toEqual(objA.propA);
    });

    it('should be able to use convertUsing to map an object with a custom type resolver function', () => {
        var objA = { propA: 'propA' };

        var fromKey = '{D1534A0F-6120-475E-B7E2-BF2489C58571}';
        var toKey = '{1896FF99-1A28-4FE6-800B-072D5616B02D}';

        automapper
            .createMap(fromKey, toKey)
            .convertUsing(function (resolutionContext : AutoMapperJs.IResolutionContext) {
                return { propA: resolutionContext.sourceValue.propA + ' (custom mapped with resolution context)' }
            });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.propA).toEqual(objA.propA + ' (custom mapped with resolution context)');
    });

    it('should be able to use convertUsing to map an object with a custom type resolver class', () => {
        // arrange
        var CustomTypeConverter = (function () {
            function CustomTypeConverter() {
            }
            CustomTypeConverter.prototype.convert = function (resolutionContext : AutoMapperJs.IResolutionContext) {
                return { propA: resolutionContext.sourceValue.propA + ' (convertUsing with a class definition)' };
            };
            return CustomTypeConverter;
        })();

        var objA = { propA: 'propA' };

        var fromKey = '{6E7F5757-1E55-4B55-BB86-44FF5B33DE2F}';
        var toKey = '{8521AE41-C3AF-4FCD-B7C7-A915C037D69E}';

        automapper
            .createMap(fromKey, toKey)
            .convertUsing(CustomTypeConverter);

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.propA).toEqual(objA.propA + ' (convertUsing with a class definition)');
    });

    it('should be able to use convertUsing to map an object with a custom type resolver instance', () => {
        // arrange
        // NOTE BL The CustomTypeConverter class definition is defined at the bottom, since TypeScript
        //         does not allow classes to be defined inline.

        var objA = { propA: 'propA' };

        var fromKey = '{BDF3758C-B38E-4343-95B6-AE0F80C8B9C4}';
        var toKey = '{13DD7AE1-4177-4A80-933B-B60A55859E50}';

        automapper
            .createMap(fromKey, toKey)
            .convertUsing(new CustomTypeConverter());

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.propA).toEqual(objA.propA + ' (convertUsing with a class instance)');
    });

    it('should fail when convertUsing is used with a function not having exactly one (resolutionContext) parameter.', () => {
        // arrange
        var caught = false;

        var fromKey = '{1EF9AC11-BAA1-48DB-9C96-9DFC40E33BCA}';
        var toKey = '{C4DA81D3-9072-4140-BFA7-431C35C01F54}';

        try {
            // act
            automapper
                .createMap(fromKey, toKey)
                .convertUsing(() => {
                    return {}
                });

            //var objB = automapper.map(fromKey, toKey, objA);
        } catch (e) {
            // assert
            caught = true;
            expect(e.message).toEqual('The value provided for typeConverterClassOrFunction is invalid, because it does not provide exactly one (resolutionContext) parameter.');
        }

        if (!caught) {
            // assert
            expect().fail('Using anything else than a function with forSoruceMember should result in an error.');
        }
    });

    it('should be able to use convertToType to map a source object to a destination object which is an instance of a given class', () => {
        //arrange
        var objA = { ApiProperty: 'From A' };


        var fromKey = '{7AC4134B-ECC1-464B-B144-5C9D8F5B5A7E}';
        var toKey = '{2BDE907C-1CE6-4CC5-A601-9A94CA6C4737}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('property', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.mapFrom('ApiProperty'); })
            .convertToType(DemoToBusinessType);

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB instanceof DemoToBusinessType).toBeTruthy();
        expect(objB.property).toEqual(objA.ApiProperty);
    });

    it('should be able to use a condition to map or ignore a property', () => {
        // arrange
        var objA = { prop: 1, prop2: 2 };

        var fromKey = '{76D23B33-888A-4DF7-BEBE-E5B99E944272}';
        var toKey = '{18192191-85FE-4729-A980-5954FCFE3954}';

        automapper
            .createMap(fromKey, toKey)
            .forMember('prop', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.condition((sourceObject: any) => sourceObject.prop === 0) })
            .forMember('prop2', (opts: AutoMapperJs.IMemberConfigurationOptions) => { opts.condition((sourceObject: any) => sourceObject.prop2 === 2) });

        // act
        var objB = automapper.map(fromKey, toKey, objA);

        // assert
        expect(objB.hasOwnProperty('prop')).not.toBeTruthy();
        expect(objB.hasOwnProperty('prop2')).toBeTruthy();
    });
});

class ClassA {
    propA: string;
}

class DemoToBusinessType {
}

class CustomTypeConverter extends AutoMapperJs.TypeConverter {
    public convert(resolutionContext: AutoMapperJs.IResolutionContext): any {
        return { propA: resolutionContext.sourceValue.propA + ' (convertUsing with a class instance)' };
    }
}