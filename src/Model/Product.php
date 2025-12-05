<?php
namespace App\Model;

use App\Service\Config;

class Product
{
    private ?int $id = null;
    private ?string $name = null;
    private ?string $description = null;
    private ?float $price = null;
    private ?int $quantity = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function setId(?int $id): Product
    {
        $this->id = $id;
        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(?string $name): Product
    {
        $this->name = $name;
        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): Product
    {
        $this->description = $description;
        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(?float $price): Product
    {
        $this->price = $price;
        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(?int $quantity): Product
    {
        $this->quantity = $quantity;
        return $this;
    }

    public static function fromArray($array): Product
    {
        $product = new self();
        $product->fill($array);
        return $product;
    }

    public function fill($array): Product
    {
        if (isset($array['id']) && ! $this->getId()) {
            $this->setId($array['id']);
        }
        if (isset($array['name'])) {
            $this->setName($array['name']);
        }
        if (isset($array['description'])) {
            $this->setDescription($array['description']);
        }
        if (isset($array['price'])) {
            $this->setPrice((float)$array['price']);
        }
        if (isset($array['quantity'])) {
            $this->setQuantity((int)$array['quantity']);
        }
        return $this;
    }

    public static function findAll(): array
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM product ORDER BY name';
        $statement = $pdo->prepare($sql);
        $statement->execute();

        $products = [];
        $productsArray = $statement->fetchAll(\PDO::FETCH_ASSOC);
        foreach ($productsArray as $productArray) {
            $products[] = self::fromArray($productArray);
        }
        return $products;
    }

    public static function find($id): ?Product
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = 'SELECT * FROM product WHERE id = :id';
        $statement = $pdo->prepare($sql);
        $statement->execute(['id' => $id]);

        $productArray = $statement->fetch(\PDO::FETCH_ASSOC);
        if (! $productArray) {
            return null;
        }
        $product = Product::fromArray($productArray);
        return $product;
    }

    public function save(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        if (! $this->getId()) {
            $sql = "INSERT INTO product (name, description, price, quantity) VALUES (:name, :description, :price, :quantity)";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                'name' => $this->getName(),
                'description' => $this->getDescription(),
                'price' => $this->getPrice(),
                'quantity' => $this->getQuantity(),
            ]);
            $this->setId($pdo->lastInsertId());
        } else {
            $sql = "UPDATE product SET name = :name, description = :description, price = :price, quantity = :quantity WHERE id = :id";
            $statement = $pdo->prepare($sql);
            $statement->execute([
                ':name' => $this->getName(),
                ':description' => $this->getDescription(),
                ':price' => $this->getPrice(),
                ':quantity' => $this->getQuantity(),
                ':id' => $this->getId(),
            ]);
        }
    }

    public function delete(): void
    {
        $pdo = new \PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $sql = "DELETE FROM product WHERE id = :id";
        $statement = $pdo->prepare($sql);
        $statement->execute([':id' => $this->getId()]);

        $this->setId(null);
        $this->setName(null);
        $this->setDescription(null);
        $this->setPrice(null);
        $this->setQuantity(null);
    }
}
