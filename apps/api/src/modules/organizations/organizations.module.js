'use strict';
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return (c > 3 && r && Object.defineProperty(target, key, r), r);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.OrganizationsModule = void 0;
const common_1 = require('@nestjs/common');
const organizations_controller_js_1 = require('./organizations.controller.js');
const organizations_repository_js_1 = require('./organizations.repository.js');
const organizations_service_js_1 = require('./organizations.service.js');
let OrganizationsModule = class OrganizationsModule {};
exports.OrganizationsModule = OrganizationsModule;
exports.OrganizationsModule = OrganizationsModule = __decorate(
  [
    (0, common_1.Module)({
      controllers: [organizations_controller_js_1.OrganizationsController],
      providers: [
        organizations_service_js_1.OrganizationsService,
        organizations_repository_js_1.OrganizationsRepository,
      ],
      exports: [organizations_service_js_1.OrganizationsService],
    }),
  ],
  OrganizationsModule,
);
//# sourceMappingURL=organizations.module.js.map
