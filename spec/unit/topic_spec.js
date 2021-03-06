const sequelize = require("../../src/db/models/index").sequelize;
const Topic = require("../../src/db/models").Topic;
const Post = require("../../src/db/models").Post;
const User = require("../../src/db/models").User;

describe("Topic", () => {
  beforeEach((done) => {
    this.topic;
    this.post;
    this.user;
    sequelize.sync({force: true}).then((res) => {
      User.create({
        email: "starman@tesla.com",
        password: "Trekkie4lyfe"
      })
      .then((user) => {
        this.user = user;
        Topic.create({
          title: "Expeditions to Alpha Centauri",
          description: "A compilation of reports from recent visits to the star system.",
          posts: [{
            title: "My first visit to Proxima Centauri b",
            body: "I saw some rocks.",
            userId: this.user.id
          }]
        }, {
          include: {
            model: Post,
            as: "posts"
          }
        })
        .then((topic) => {
          this.topic = topic;
          this.post = topic.posts[0];
          done();
        })
      })
    });
  });

  describe("#Create", () => {
    it("should create a topic with title and description", (done) => {
      Topic.create({
        title: "Challenges of interstellar travel",
        description: "1. The Wi-Fi is terrible"
      })
      .then((topic) => {
        expect(topic.title).toBe("Challenges of interstellar travel");
        expect(topic.description).toBe("1. The Wi-Fi is terrible");
        done();
      });
    });

    it("should not create a topic with missing title or description", (done) => {
       Topic.create({
       })
       .then((Topic) => {
          // the code in this block will not be evaluated since the validation error
        // will skip it. Instead, we'll catch the error in the catch block below
        // and set the expectations there
           done();

       })
       .catch((err) => {
         expect(err.message).toContain("Topic.title cannot be null");
         expect(err.message).toContain("Topic.description cannot be null");
         done();
       })
     });
  });

  describe("#getPosts", () => {
    it("should return all posts associated with the topic in scope", (done) => {
      Post.create({
        title: "Pros of Cryosleep during the long journey",
        body: "1. Not having to answer the 'are we there yet?' question.",
        topicId: this.topic.id,
        userId: this.user.id
      })
      .then(() => {
        this.topic.getPosts()
        .then((posts) => {
          expect(posts[0].title).toBe("My first visit to Proxima Centauri b");
          expect(posts[1].title).toBe("Pros of Cryosleep during the long journey");
          expect(this.topic.title).toBe("Expeditions to Alpha Centauri");
          done();
        })
      })
    })
  })
});
