const request = require("request");
const server = require ("../../src/server");
const base = "http://localhost:3000/ads/";

const sequelize = require("../../src/db/models/index").sequelize;
const Ad = require("../../src/db/models").Advertisement;

describe("routes : ads", () => {

  beforeEach((done) => {
    this.ad;
    sequelize.sync({force: true}).then((res) => {

       Ad.create({
         title: "Bloccit",
         description: "A reddit like app"
       })
        .then((ad) => {
          this.ad = ad;
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });

      });
  });

  describe("GET /ads", () => {
    it("should return a status code 200 and all ads", (done) => {
      request.get(base, (err, res, body) => {
        expect(res.statusCode).toBe(200);
        expect(err).toBeNull();
        expect(body).toContain("Advertisements");
        expect(body).toContain("Bloccit");
        done();
      });
    });
  });

  describe("GET /ads/new", () => {
    it("should render a new ad form", (done) => {
      request.get(`${base}new`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("New Ad");
        done();
      });
    });
  });

  describe("POST /ads/create", () => {
    const options = {
      url: `${base}create`,
      form: {
        title: "Bloc Jams",
        description: "An online music app"
      }
    };
    it("should create a new add and redirect", (done) => {
      request.post(options, (err, res, body) => {
        Ad.findOne({where: {title: "Bloc Jams"}})
        .then((ad) => {
          expect(res.statusCode).toBe(303);
          expect(ad.title).toBe("Bloc Jams");
          expect(ad.description).toBe("An online music app");
          done();
        })
        .catch((err) => {
          console.log(err);
          done();
        });
      });
    });
  });

  describe("GET /ads/:id", () => {
    it("should render the selected ad page", (done) => {
      request.get(`${base}${this.ad.id}`, (err,res,body) => {
        expect(err).toBeNull();
        expect(body).toContain("Bloccit");
        done();
      });
    });
  });

  describe("POST /ads/:id/destroy", () => {
    it("should delete the ad with the associated id", (done) => {
      Ad.all()
      .then(ads => {
        const adCountBeforeDelete = ads.length;
        expect(adCountBeforeDelete).toBe(1);
        request.post(`${base}${this.ad.id}/destroy`, (err, res, body) => {
          Ad.all()
          .then(ads => {
            expect(err).toBeNull();
            expect(ads.length).toBe(adCountBeforeDelete -1);
            done();
          });
        });
      });
    });
  });

  describe("GET /ads/:id/edit", () => {
    it("should render a view with edit ad form", (done) => {
      request.get(`${base}${this.ad.id}/edit`, (err, res, body) => {
        expect(err).toBeNull();
        expect(body).toContain("Edit Ad");
        expect(body).toContain("Bloccit");
        done();
      });
    });
  });

  describe("POST /ads/:id/update", () => {
    it("should update the add with the new value", (done) => {
      const options = {
        url: `${base}${this.ad.id}/update`,
        form: {
          title: "Bloc",
          description: "web development apprenticeship program"
        }
      };
      request.post(options, (err,res,body) => {
        expect(err).toBeNull();
        Ad.findOne({
          where: {id: this.ad.id}
        })
        .then(ad => {
          expect(ad.title).toBe("Bloc");
          done();
        });
      });
    });
  });

});
